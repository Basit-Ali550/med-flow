"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus, Search, Loader2 } from "lucide-react";

// Custom Components
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { AIAnalysisModal } from "@/components/Modals/AIAnalysisModal";
import { TreatmentConfirmationModal } from "@/components/Modals/TreatmentConfirmationModal";
import { UpdateVitalsModal } from "@/components/Modals/UpdateVitalsModal";
import { PatientHistoryModal } from "@/components/Modals/PatientHistoryModal";
import { PatientCard } from "@/components/Dashboard/PatientCard";
import { SortablePatientCard } from "@/components/Dashboard/SortablePatientCard";
import { DroppableContainer } from "@/components/Dashboard/DroppableContainer";
import { DashboardActions } from "@/components/Dashboard/DashboardActions";
import { StatusCard } from "@/components/Dashboard/StatusCard";

// Hooks
import { usePatients } from "@/hooks/usePatients";

// Helpers
import { getWaitTimeMinutes } from "@/lib/utils";
import { PATIENT_STATUS } from "@/lib/constants";

export default function NurseDashboard() {
  const router = useRouter();
  
  // --- Data Hook ---
  const { 
    items, 
    setItems, 
    isLoading, 
    updatePatientStatus, 
    deletePatient 
  } = usePatients();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  
  // --- Modal State Refactor ---
  const [activeModal, setActiveModal] = useState({ 
    type: null, // 'DELETE' | 'AI' | 'TREATMENT' | 'HISTORY' | 'VITALS'
    patient: null 
  });

  const openModal = (type, patient) => setActiveModal({ type, patient });
  const closeModal = () => setActiveModal({ type: null, patient: null });

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Filter Items ---
  const unscheduledItems = items.filter(p => p.status === PATIENT_STATUS.WAITING);
  // Only show Triaged items in Scheduled column
  const scheduledItems = items.filter(p => p.status === PATIENT_STATUS.TRIAGED);

  const filteredUnscheduled = unscheduledItems.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredScheduled = scheduledItems.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePatient = items.find(p => p._id === activeId);

  // --- Handlers ---

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const patientId = active.id;
    const isOverScheduled = over.id === 'scheduled-container' || 
                            scheduledItems.some(p => p._id === over.id);

    const isOverUnscheduled = over.id === 'unscheduled-container' || 
                              unscheduledItems.some(p => p._id === over.id);

    const draggedItem = items.find(p => p._id === patientId);
    if (!draggedItem) return;

    const previousItems = [...items];
    let newStatus = null;
    let shouldTriggerAI = false;

    // Logic: Move Left -> Right (Unscheduled -> Scheduled)
    if (draggedItem.status === PATIENT_STATUS.WAITING && isOverScheduled) {
       newStatus = PATIENT_STATUS.TRIAGED;
       shouldTriggerAI = true; 
    } 
    // Logic: Move Right -> Left (Scheduled -> Unscheduled)
    else if (draggedItem.status !== PATIENT_STATUS.WAITING && isOverUnscheduled) {
       newStatus = PATIENT_STATUS.WAITING;
    }

    // If status changed, update state and API
    if (newStatus && newStatus !== draggedItem.status) {
      // Optimistic Update
      setItems(prev => prev.map(p => 
        p._id === patientId ? { ...p, status: newStatus } : p
      ));

      // Trigger AI Modal
      if (shouldTriggerAI) {
        const waitTime = getWaitTimeMinutes(draggedItem.registeredAt);
        // Note: We open modal with the *updated* local data context
        openModal('AI', { ...draggedItem, waitTime });
      }

      // API Call
      const success = await updatePatientStatus(patientId, newStatus);
      if (success) {
        toast.success(newStatus === PATIENT_STATUS.TRIAGED ? 'Moved to Scheduled' : 'Moved back to Unscheduled');
      } else {
        setItems(previousItems); // Rollback on failure
      }
    }
  };

  const handleAddPatient = () => router.push("/nurse/add-patient");
  const handleEdit = (patient) => router.push(`/nurse/edit-patient/${patient._id}`);
  
  const handleDeleteClick = (patient) => {
    openModal('DELETE', patient);
  };

  const handleConfirmDelete = async () => {
    const patient = activeModal.patient;
    if (!patient) return;
    
    // Optimistic Delete handled by hook, but we assume success
    const success = await deletePatient(patient._id);
    if (success) {
       closeModal();
    }
  };

  const handleCardClick = (patient) => {
    // Only open for Scheduled/Triaged patients
    if (patient.status === PATIENT_STATUS.TRIAGED) {
      openModal('TREATMENT', patient);
    }
  };

  const handleConfirmTreatment = async () => {
    const patient = activeModal.patient;
    if (!patient) return;
    
    // Optimistic Update: Update UI immediately
    const previousItems = [...items];
    setItems(prev => prev.map(p => 
      p._id === patient._id ? { ...p, status: PATIENT_STATUS.IN_PROGRESS } : p
    ));
    
    closeModal();

    // API Call
    const success = await updatePatientStatus(patient._id, PATIENT_STATUS.IN_PROGRESS);
    if (success) {
       toast.success("Patient sent to treatment room");
    } else {
       // Rollback
       setItems(previousItems);
       toast.error("Failed to update status");
    }
  };

  const handleHistoryClick = (patient) => openModal('HISTORY', patient);
  const handleVitalsClick = (patient) => openModal('VITALS', patient);
  
  const handleVitalsUpdate = (updatedPatient) => {
    setItems(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
  };

  return (
    <div className="min-h-screen">
      
      {/* --- Unified Modals Section --- */}
      <DeleteModal 
        isOpen={activeModal.type === 'DELETE'}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        title="Delete Patient?"
        description="Are you sure you want to delete this patient? The patient will be removed from the waitlist. This action cannot be undone."
      />

      <AIAnalysisModal 
        isOpen={activeModal.type === 'AI'}
        onClose={closeModal}
        patient={activeModal.patient}
      />

      <TreatmentConfirmationModal
        isOpen={activeModal.type === 'TREATMENT'}
        onClose={closeModal}
        onConfirm={handleConfirmTreatment}
        patientName={activeModal.patient?.fullName}
      />

      <UpdateVitalsModal 
        isOpen={activeModal.type === 'VITALS'}
        onClose={closeModal}
        patient={activeModal.patient}
        onUpdateSuccess={handleVitalsUpdate}
      />

      <PatientHistoryModal 
        isOpen={activeModal.type === 'HISTORY'}
        onClose={closeModal}
        patient={activeModal.patient}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Actions Bar */}
        <DashboardActions 
          searchQuery={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
          onAddClick={handleAddPatient}
        />

        {/* DnD Context */}
        <DndContext 
          sensors={sensors} 
          collisionDetection={rectIntersection} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 sm:gap-24 gap-8">
            
        
            <div className="flex flex-col gap-8">
              <StatusCard 
                title="unscheduled" 
                subtitle="Waiting list" 
                count={filteredUnscheduled.length} 
              />

              {/* Droppable Area */}
              <DroppableContainer id="unscheduled-container" className="space-y-3 min-h-[300px] rounded-xl transition-all">
                <SortableContext items={filteredUnscheduled.map(p => p._id)} strategy={verticalListSortingStrategy}>
                  {isLoading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-teal-600" /></div>
                  ) : filteredUnscheduled.map(patient => (
                    <SortablePatientCard 
                      key={patient._id} 
                      patient={patient} 
                      onEdit={handleEdit} 
                      onDelete={handleDeleteClick}
                      onHistory={handleHistoryClick}
                      onVitals={handleVitalsClick}
                    />
                  ))}
                  {!isLoading && filteredUnscheduled.length === 0 && (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl bg-gray-50/50">
                       No unscheduled patients
                    </div>
                  )}
                </SortableContext>
              </DroppableContainer>
            </div>

          
            <div className="flex flex-col gap-8">
               <StatusCard 
                 title="scheduled" 
                 subtitle="triaged list" 
                 count={filteredScheduled.length} 
               />

              {/* Droppable Area */}
              <DroppableContainer 
                id="scheduled-container" 
                className={`space-y-3 min-h-[300px] transition-all ${
                  filteredScheduled.length === 0 ? ' bg-white flex items-center justify-center' : ''
                }`}
              >
                 <SortableContext items={filteredScheduled.map(p => p._id)} strategy={verticalListSortingStrategy}>
                    {filteredScheduled.map(patient => (
                      <SortablePatientCard 
                        key={patient._id} 
                        patient={patient} 
                        onEdit={handleEdit} 
                        onDelete={handleDeleteClick}
                        onHistory={handleHistoryClick}
                        onVitals={handleVitalsClick}
                        onClick={handleCardClick}
                      />
                    ))}
                    
                    {/* Persistent Drop Zone Placeholder */}
                    <div className="mt-4 w-full min-h-[100px] p-6 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50/50 transition-colors hover:border-teal-200 hover:bg-teal-50/30">
                       Drag patients here for Triage
                    </div>
                 </SortableContext>
              </DroppableContainer>
            </div>

          </div>

          <DragOverlay>
            {activePatient ? <PatientCard patient={activePatient} isOverlay /> : null}
          </DragOverlay>

        </DndContext>
      </main>
    </div>
  );
}
