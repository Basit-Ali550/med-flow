"use client";

import React, { useState, useCallback } from "react";
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
  arrayMove,
} from "@dnd-kit/sortable";

import { Plus, Search, Loader2 } from "lucide-react";

// Custom Components
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { AIAnalysisModal } from "@/components/Modals/AIAnalysisModal";
import { AIAnalysisViewModal } from "@/components/Modals/AIAnalysisViewModal";
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
    updatePatient, // Need this for saving AI data/Pinning
    deletePatient 
  } = usePatients();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  
  // --- Modal State Refactor ---
  const [activeModal, setActiveModal] = useState({ 
    type: null, // 'DELETE' | 'AI' | 'TREATMENT' | 'HISTORY' | 'VITALS'
    patient: null,
    meta: null 
  });

  const openModal = (type, patient, meta = null) => setActiveModal({ type, patient, meta });
  const closeModal = () => setActiveModal({ type: null, patient: null, meta: null });

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

  // --- Sorting Logic ---
  
  // 1. Unscheduled List (Manual Order + Fallback to Newest)
  const sortedUnscheduledItems = [...filteredUnscheduled].sort((a, b) => {
      // Manual Order (Ascending)
      const orderA = a.manualOrder ?? 0;
      const orderB = b.manualOrder ?? 0;
      if (Math.abs(orderA - orderB) > 0.00001) {
          return orderA - orderB;
      }
      // Fallback: Registration Time (Desc/LIFO as per API default)
      return new Date(b.registeredAt) - new Date(a.registeredAt); 
  });

  // 2. Scheduled List (Pinned > Manual > Score > Wait Time)
  const sortedScheduledItems = [...filteredScheduled].sort((a, b) => {
    // 1. Pinned items first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // 2. Manual Order (Ascending)
    // Allows dragging patients to specific positions, overriding other sorts.
    const orderA = a.manualOrder ?? 0;
    const orderB = b.manualOrder ?? 0;
    if (Math.abs(orderA - orderB) > 0.00001) {
        return orderA - orderB;
    }

    // 3. High Urgency Score (if available)
    const scoreA = a.aiAnalysis?.score || 0;
    const scoreB = b.aiAnalysis?.score || 0;
    if (scoreA !== scoreB) {
        return scoreB - scoreA; // Descending order
    }

    // 4. Fallback: Registration Time (FIFO)
    return new Date(a.registeredAt) - new Date(b.registeredAt);
  });

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

    // Logic 1: Move Left -> Right (Unscheduled -> Scheduled)
    if (draggedItem.status === PATIENT_STATUS.WAITING && isOverScheduled) {
       newStatus = PATIENT_STATUS.TRIAGED;
       shouldTriggerAI = true; 
    } 
    // Logic 2: Move Right -> Left (Scheduled -> Unscheduled)
    else if (draggedItem.status !== PATIENT_STATUS.WAITING && isOverUnscheduled) {
       newStatus = PATIENT_STATUS.WAITING;
    }
    // Logic 3: Reorder within Scheduled List
    else if (draggedItem.status === PATIENT_STATUS.TRIAGED && isOverScheduled && active.id !== over.id) {
       const oldIndex = sortedScheduledItems.findIndex(p => p._id === active.id);
       const newIndex = sortedScheduledItems.findIndex(p => p._id === over.id);

       if (oldIndex !== -1 && newIndex !== -1) {
           // Simulate the move to calculate neighbors
           const reorderedList = arrayMove(sortedScheduledItems, oldIndex, newIndex);
           const movedItemIndex = reorderedList.findIndex(p => p._id === active.id);
           
           const prevItem = reorderedList[movedItemIndex - 1];
           const nextItem = reorderedList[movedItemIndex + 1];

           const lowerBound = prevItem ? (prevItem.manualOrder ?? 0) : null;
           const upperBound = nextItem ? (nextItem.manualOrder ?? 0) : null;

           let newOrder;
           if (lowerBound !== null && upperBound !== null) {
               newOrder = (lowerBound + upperBound) / 2;
           } else if (lowerBound !== null) {
               newOrder = lowerBound + 10000;
           } else if (upperBound !== null) {
               newOrder = upperBound - 10000;
           } else {
               newOrder = 0;
           }

           // Optimistic Update
           setItems(prev => prev.map(p => 
               p._id === patientId ? { ...p, manualOrder: newOrder } : p
           ));

           // API Call (Fire and forget generally, or toast on error)
           try {
              await updatePatient(patientId, { manualOrder: newOrder });
           } catch (err) {
              setItems(previousItems);
              toast.error("Failed to reorder");
           }
       }
       return;
    }
    // Logic 4: Reorder within Unscheduled List
    else if (draggedItem.status === PATIENT_STATUS.WAITING && isOverUnscheduled && active.id !== over.id) {
       const oldIndex = sortedUnscheduledItems.findIndex(p => p._id === active.id);
       const newIndex = sortedUnscheduledItems.findIndex(p => p._id === over.id);

       if (oldIndex !== -1 && newIndex !== -1) {
           const reorderedList = arrayMove(sortedUnscheduledItems, oldIndex, newIndex);
           const movedItemIndex = reorderedList.findIndex(p => p._id === active.id);
           
           const prevItem = reorderedList[movedItemIndex - 1];
           const nextItem = reorderedList[movedItemIndex + 1];

           const lowerBound = prevItem ? (prevItem.manualOrder ?? 0) : null;
           const upperBound = nextItem ? (nextItem.manualOrder ?? 0) : null;

           let newOrder;
           if (lowerBound !== null && upperBound !== null) {
               newOrder = (lowerBound + upperBound) / 2;
           } else if (lowerBound !== null) {
               newOrder = lowerBound + 10000;
           } else if (upperBound !== null) {
               newOrder = upperBound - 10000;
           } else {
               newOrder = 0;
           }

           // Optimistic Update
           setItems(prev => prev.map(p => 
               p._id === patientId ? { ...p, manualOrder: newOrder } : p
           ));

           try {
              await updatePatient(patientId, { manualOrder: newOrder });
           } catch (err) {
              setItems(previousItems);
              toast.error("Failed to reorder");
           }
       }
       return;
    }

    // Apply Status Changes (Logic 1 & 2)
    if (newStatus && newStatus !== draggedItem.status) {
      // Keep manualOrder roughly generic or reset? Keep it.
      
      // Optimistic Update
      setItems(prev => prev.map(p => 
        p._id === patientId ? { ...p, status: newStatus } : p
      ));

      // Trigger AI Modal
      if (shouldTriggerAI) {
        const waitTime = getWaitTimeMinutes(draggedItem.registeredAt);

        // Check Vitals First
        const hasVitals = draggedItem.vitalSigns && (
            draggedItem.vitalSigns.heartRate || 
            draggedItem.vitalSigns.bloodPressureSys || 
            draggedItem.vitalSigns.temperature || 
            draggedItem.vitalSigns.o2Saturation
        );
        
        const updatedItemForModal = { 
            ...draggedItem, 
            status: newStatus, 
            waitTime 
        };

        if (!hasVitals) {
             // Open Vitals Modal first, then chain AI
             openModal('VITALS', updatedItemForModal, { next: 'AI' });
        } else {
             const hasAnalysis = draggedItem.aiAnalysis && draggedItem.aiAnalysis.score != null;
             openModal(hasAnalysis ? 'AI_VIEW' : 'AI', updatedItemForModal);
        }
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
  
  const handleVitalsUpdate = useCallback((updatedPatient) => {
    setItems(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
    
    // Check for chained action (e.g. AI Analysis after Vitals)
    // IMPORTANT: Consume the 'next' instruction immediately to prevent loops
    if (activeModal.meta?.next === 'AI') {
        // Clear the interaction meta so subsequent updates don't re-trigger this
        setActiveModal(prev => ({ ...prev, meta: null }));

        setTimeout(() => {
             openModal('AI', updatedPatient);
        }, 300); // 300ms for smooth modal transition
    }
  }, [activeModal.meta, setItems]); // Dependency on meta is key

  const handleAnalysisComplete = useCallback(async (updatedPatient) => {
     // 1. Update Local State immediately
     setItems(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
     
     // 2. Persist to API
     try {
       await updatePatient(updatedPatient._id, {
           aiAnalysis: updatedPatient.aiAnalysis,
           triageLevel: updatedPatient.triageLevel // Persist top-level triage
       });
       toast.success("AI Analysis saved to patient record");
     } catch (err) {
       console.error("Failed to save analysis", err);
       toast.error("Failed to save analysis");
     }
  }, [updatePatient, setItems]);

  const handlePin = async (patient) => {
      const newPinnedState = !patient.isPinned;
      
      // Optimistic Update
      setItems(prev => prev.map(p => p._id === patient._id ? { ...p, isPinned: newPinnedState } : p));
      
      try {
          await updatePatient(patient._id, { isPinned: newPinnedState });
      } catch (err) {
           // Rollback
          setItems(prev => prev.map(p => p._id === patient._id ? { ...p, isPinned: !newPinnedState } : p));
          toast.error("Failed to update pin status");
      }
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
        onAnalysisComplete={handleAnalysisComplete}
      />

      <AIAnalysisViewModal 
        isOpen={activeModal.type === 'AI_VIEW'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 sm:gap-12 gap-8">
            
        
            <div className="flex flex-col gap-8">
              <StatusCard 
                title="unscheduled" 
                subtitle="Waiting list" 
                count={filteredUnscheduled.length} 
              />

              {/* Droppable Area */}
              <DroppableContainer id="unscheduled-container" className="space-y-3 min-h-[300px] rounded-xl transition-all">
                <SortableContext items={sortedUnscheduledItems.map(p => p._id)} strategy={verticalListSortingStrategy}>
                  {isLoading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-teal-600" /></div>
                  ) : sortedUnscheduledItems.map(patient => (
                    <SortablePatientCard 
                      key={patient._id} 
                      patient={patient} 
                      onEdit={handleEdit} 
                      onDelete={handleDeleteClick}
                      onHistory={handleHistoryClick}
                      onVitals={handleVitalsClick}
                      onTriageChange={async (patient, newLevel) => {
                          setItems(prev => prev.map(p => p._id === patient._id ? { 
                              ...p, 
                              triageLevel: newLevel,
                              aiAnalysis: { ...p.aiAnalysis, triageLevel: newLevel }
                          } : p));
                          
                          try {
                              await updatePatient(patient._id, { triageLevel: newLevel });
                              toast.success("Priority level updated");
                          } catch (error) {
                              toast.error("Failed to update priority");
                          }
                      }}
                    />
                  ))}
                  {!isLoading && sortedUnscheduledItems.length === 0 && (
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
                  sortedScheduledItems.length === 0 ? ' bg-white flex items-center justify-center' : ''
                }`}
              >
                 <SortableContext items={sortedScheduledItems.map(p => p._id)} strategy={verticalListSortingStrategy}>
                    {sortedScheduledItems.map(patient => (
                      <SortablePatientCard 
                        key={patient._id} 
                        patient={patient} 
                        onEdit={handleEdit} 
                        onDelete={handleDeleteClick}
                        onHistory={handleHistoryClick}
                        onVitals={handleVitalsClick}
                        onClick={handleCardClick}
                        onPin={handlePin}
                        onTriageChange={async (patient, newLevel) => {
                            // Optimistic Update
                            setItems(prev => prev.map(p => p._id === patient._id ? { 
                                ...p, 
                                triageLevel: newLevel,
                                aiAnalysis: { ...p.aiAnalysis, triageLevel: newLevel } // Sync AI display too
                            } : p));
                            
                            try {
                                await updatePatient(patient._id, { triageLevel: newLevel });
                                toast.success("Priority level updated");
                            } catch (error) {
                                toast.error("Failed to update priority");
                               
                            }
                        }}
                        onAIAnalysis={(patient) => {
                          const hasAnalysis = patient.aiAnalysis && patient.aiAnalysis.score != null;
                          openModal(hasAnalysis ? 'AI_VIEW' : 'AI', patient);
                        }}
                      />
                    ))}
                    
                    {/* Persistent Drop Zone Placeholder */}
                  
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
