"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Menu, Loader2 } from "lucide-react";

// Custom Components
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { AIAnalysisModal } from "@/components/Modals/AIAnalysisModal";
import { PatientCard } from "@/components/Dashboard/PatientCard";
import { SortablePatientCard } from "@/components/Dashboard/SortablePatientCard";
import { DroppableContainer } from "@/components/Dashboard/DroppableContainer";

// Hooks
import { usePatients } from "@/hooks/usePatients";

const calculateCurrentWaitTime = (registeredAt) => {
  if (!registeredAt) return 0;
  return Math.floor((Date.now() - new Date(registeredAt).getTime()) / 60000);
};

export default function NurseDashboard() {
  const router = useRouter();
  
  // Data Hook
  const { 
    items, 
    setItems, 
    isLoading, 
    updatePatientStatus, 
    deletePatient 
  } = usePatients();

  // Local State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  
  // Modals State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, patient: null });
  const [aiModal, setAiModal] = useState({ isOpen: false, patient: null });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filter Items
  const unscheduledItems = items.filter(p => p.status === 'Waiting');
  const scheduledItems = items.filter(p => p.status !== 'Waiting');

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
    if (draggedItem.status === 'Waiting' && isOverScheduled) {
       newStatus = 'Triaged';
       shouldTriggerAI = true; 
    } 
    // Logic: Move Right -> Left (Scheduled -> Unscheduled)
    else if (draggedItem.status !== 'Waiting' && isOverUnscheduled) {
       newStatus = 'Waiting';
    }

    // If status changed, update state and API
    if (newStatus && newStatus !== draggedItem.status) {
      // Optimistic Update
      setItems(prev => prev.map(p => 
        p._id === patientId ? { ...p, status: newStatus } : p
      ));

      // Trigger AI Modal
      if (shouldTriggerAI) {
        const waitTime = calculateCurrentWaitTime(draggedItem.registeredAt);
          
        setAiModal({
          isOpen: true,
          patient: { ...draggedItem, waitTime },
        });
      }

      // API Call
      const success = await updatePatientStatus(patientId, newStatus);
      if (success) {
        toast.success(newStatus === 'Triaged' ? 'Moved to Scheduled' : 'Moved back to Unscheduled');
      } else {
        setItems(previousItems); // Rollback on failure
      }
    }
  };

  const handleAddPatient = () => router.push("/nurse/add-patient");
  const handleEdit = (patient) => router.push(`/nurse/edit-patient/${patient._id}`);
  
  const handleDeleteClick = (patient) => {
    setDeleteModal({ isOpen: true, patient });
  };

  const handleConfirmDelete = async () => {
    const patient = deleteModal.patient;
    if (!patient) return;
    
    const success = await deletePatient(patient._id);
    if (success) {
       setDeleteModal({ isOpen: false, patient: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {/* Modals */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, patient: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Patient?"
        description="Are you sure you want to delete this patient? The patient will be removed from the waitlist. This action cannot be undone."
      />

      <AIAnalysisModal 
        isOpen={aiModal.isOpen}
        onClose={() => setAiModal({ isOpen: false, patient: null })}
        patient={aiModal.patient}
      />

      {/* Header removed - provided by Layout */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        
        {/* Actions Bar */}
        <div className="flex justify-end gap-4 mb-8">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search Patients..." 
              className="pl-9 rounded-full border-gray-200 shadow-sm focus-visible:ring-teal-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddPatient} className="rounded-full bg-teal-600 hover:bg-teal-700 px-6 shadow-md shadow-teal-600/20">
            <Plus className="w-4 h-4 mr-2" /> Add Patient
          </Button>
        </div>

        {/* DnD Context */}
        <DndContext 
          sensors={sensors} 
          collisionDetection={rectIntersection} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* --- Unscheduled Column (Left) --- */}
            <div className="flex flex-col gap-4">
              <Card className="p-4 flex justify-between items-center shadow-sm border-gray-100">
                <div>
                   <h2 className="font-bold text-lg text-gray-900">unscheduled</h2>
                   <p className="text-xs text-gray-500 font-medium">Waiting list</p>
                </div>
                <span className="text-2xl font-bold">{filteredUnscheduled.length}</span>
              </Card>

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

            {/* --- Scheduled Column (Right) --- */}
            <div className="flex flex-col gap-4">
               <Card className="p-4 flex justify-between items-center shadow-sm border-gray-100">
                <div>
                   <h2 className="font-bold text-lg text-gray-900">scheduled</h2>
                   <p className="text-xs text-gray-500 font-medium">triaged list</p>
                </div>
                <span className="text-2xl font-bold">{filteredScheduled.length}</span>
              </Card>

              {/* Droppable Area */}
              <DroppableContainer 
                id="scheduled-container" 
                className={`space-y-3 min-h-[300px] border-2 border-dashed rounded-xl p-4 transition-all ${
                  filteredScheduled.length === 0 ? 'border-gray-300 bg-white flex items-center justify-center' : 'border-transparent'
                }`}
              >
                 <SortableContext items={filteredScheduled.map(p => p._id)} strategy={verticalListSortingStrategy}>
                    {filteredScheduled.map(patient => (
                      <SortablePatientCard 
                        key={patient._id} 
                        patient={patient} 
                        onEdit={handleEdit} 
                        onDelete={handleDeleteClick}
                      />
                    ))}
                    
                    {/* Persistent Drop Zone Placeholder */}
                    <div className="mt-4 p-6 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50/50 transition-colors hover:border-teal-200 hover:bg-teal-50/30">
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
