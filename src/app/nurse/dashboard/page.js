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
  arrayMove,
} from "@dnd-kit/sortable";

import { Loader2, Clock, Stethoscope, Activity, FileText, AlertTriangle, UserPlus } from "lucide-react";

// Custom Components
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { AIAnalysisModal } from "@/components/Modals/AIAnalysisModal";
import { TreatmentConfirmationModal } from "@/components/Modals/TreatmentConfirmationModal";
import { UpdateVitalsModal } from "@/components/Modals/UpdateVitalsModal";
import { PatientHistoryModal } from "@/components/Modals/PatientHistoryModal";
import { EditPatientModal } from "@/components/Modals/EditPatientModal"; // New Import
import { PatientCard } from "@/components/Dashboard/PatientCard";
import { SortablePatientCard } from "@/components/Dashboard/SortablePatientCard";
import { DroppableContainer } from "@/components/Dashboard/DroppableContainer";
import { DashboardActions } from "@/components/Dashboard/DashboardActions";
import { StatusCard } from "@/components/Dashboard/StatusCard";
import { Button } from "@/components/ui/button";

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
    updatePatient,
    deletePatient,
    refreshPatients
  } = usePatients();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  // --- Modal State ---
  const [activeModal, setActiveModal] = useState({
    type: null,
    patient: null
  });

  const openModal = (type, patient) => setActiveModal({ type, patient });
  const closeModal = () => setActiveModal({ type: null, patient: null });

  // Update items when AI Analysis or Vitals updates complete
  const handleDataUpdate = (updatedPatient) => {
    setItems(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
  };

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Filter Items ---
  const unscheduledItems = items.filter(p => p.status === PATIENT_STATUS.WAITING);
  const scheduledItems = items.filter(p => p.status === PATIENT_STATUS.TRIAGED);

  const filteredUnscheduledRaw = unscheduledItems.filter(p =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedUnscheduled = filteredUnscheduledRaw.filter(p => p.isPinned);
  const unpinnedUnscheduled = filteredUnscheduledRaw.filter(p => !p.isPinned).sort((a, b) => (a.manualOrder || 0) - (b.manualOrder || 0));

  const sortedUnscheduled = [...pinnedUnscheduled, ...unpinnedUnscheduled];
  const filteredScheduled = scheduledItems.filter(p =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePatient = items.find(p => p._id === activeId);

  // Sorting: Critical (1) first, then by triage level
  // Sorting: Pinned items first, then by manual order (or priority if no order yet)
  const pinnedScheduled = filteredScheduled.filter(p => p.isPinned);
  const unpinnedScheduled = filteredScheduled.filter(p => !p.isPinned).sort((a, b) => {
    // Default to 0 if undefined. Sort ascending.
    return (a.manualOrder || 0) - (b.manualOrder || 0);
  });

  const sortedScheduled = [...pinnedScheduled, ...unpinnedScheduled];


  // --- Handlers ---

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // 1. Reordering within the same list logic?
    if (active.id !== over.id) {
      const activeItem = items.find(p => p._id === active.id);
      const overItem = items.find(p => p._id === over.id);

      // Handle Reordering within "Scheduled/Unpinned" list
      const isUnscheduled = activeItem.status === PATIENT_STATUS.WAITING;
      const targetList = isUnscheduled ? unpinnedUnscheduled : unpinnedScheduled;

      if (activeItem && overItem &&
        activeItem.status === overItem.status &&
        (!activeItem.isPinned && !overItem.isPinned)
      ) {
        const oldIndex = targetList.findIndex(p => p._id === active.id);
        const newIndex = targetList.findIndex(p => p._id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrderArray = arrayMove(targetList, oldIndex, newIndex);
          const updates = newOrderArray.map((p, index) => ({ _id: p._id, manualOrder: index }));

          setItems(prev => prev.map(p => {
            const update = updates.find(u => u._id === p._id);
            return update ? { ...p, manualOrder: update.manualOrder } : p;
          }));

          updates.forEach(u => updatePatient(u._id, { manualOrder: u.manualOrder }));
          return;
        }
      }
    }


    const patientId = active.id;
    const isOverScheduled = over.id === 'scheduled-container' ||
      scheduledItems.some(p => p._id === over.id);

    const isOverUnscheduled = over.id === 'unscheduled-container' ||
      unscheduledItems.some(p => p._id === over.id);

    const draggedItem = items.find(p => p._id === patientId);
    if (!draggedItem) return;

    const previousItems = [...items];
    let newStatus = null;
    let updates = {};
    let shouldTriggerAI = false;

    // Logic: Move Left -> Right (Unscheduled -> Scheduled)
    if (draggedItem.status === PATIENT_STATUS.WAITING && isOverScheduled) {
      // Check if vitals exist before moving to Triage/AI
      const hasVitals = draggedItem.vitalSigns && (
        draggedItem.vitalSigns.bloodPressureSys ||
        draggedItem.vitalSigns.heartRate ||
        draggedItem.vitalSigns.temperature ||
        draggedItem.vitalSigns.o2Saturation
      );

      if (!hasVitals) {
        toast.error("Vitals required before Triage", {
          description: "Please record patient vitals first."
        });
        openModal('VITALS', draggedItem);
        return; // Stop the drag/update
      }

      newStatus = PATIENT_STATUS.TRIAGED;
      // Assign to end of list
      const maxOrder = unpinnedScheduled.length > 0
        ? Math.max(...unpinnedScheduled.map(p => p.manualOrder || 0))
        : -1;

      updates = { status: newStatus, manualOrder: maxOrder + 1 };
      // OPEN AI ONLY
      shouldTriggerAI = true;
    }
    // Logic: Move Right -> Left (Scheduled -> Unscheduled)
    else if (draggedItem.status !== PATIENT_STATUS.WAITING && isOverUnscheduled) {
      newStatus = PATIENT_STATUS.WAITING;
      // Assign to end of Unscheduled list
      const maxOrder = sortedUnscheduled.length > 0
        ? Math.max(...sortedUnscheduled.map(p => p.manualOrder || 0))
        : -1;
      updates = { status: newStatus, manualOrder: maxOrder + 1 };
    }

    if (newStatus && newStatus !== draggedItem.status) {
      // Optimistic Update
      setItems(prev => prev.map(p =>
        p._id === patientId ? { ...p, ...updates } : p
      ));

      if (shouldTriggerAI) {
        const waitTime = getWaitTimeMinutes(draggedItem.registeredAt);
        openModal('AI', { ...draggedItem, ...updates, waitTime });
      }

      const success = await updatePatient(patientId, updates);
      if (success) {
        toast.success(newStatus === PATIENT_STATUS.TRIAGED ? 'Triaged (Analysis Pending)' : 'Moved back to Unscheduled');
      } else {
        setItems(previousItems);
        toast.error("Failed to update status");
      }
    }
  };

  const handleAddPatient = () => router.push("/nurse/add-patient");
  // const handleEdit = (patient) => router.push(`/nurse/edit-patient/${patient._id}`);
  // Reformatted to use Modal
  const handleEdit = (patient) => openModal('EDIT', patient);

  const handleDeleteClick = (patient) => openModal('DELETE', patient);
  const handleConfirmDelete = async () => {
    const patient = activeModal.patient;
    if (!patient) return;
    const success = await deletePatient(patient._id);
    if (success) closeModal();
  };

  const handleConfirmTreatment = async () => {
    const patient = activeModal.patient;
    if (!patient) return;

    const previousItems = [...items];
    setItems(prev => prev.map(p =>
      p._id === patient._id ? { ...p, status: PATIENT_STATUS.IN_PROGRESS } : p
    ));
    closeModal();

    const success = await updatePatient(patient._id, { status: PATIENT_STATUS.IN_PROGRESS });
    if (success) {
      toast.success("Patient sent to treatment room");
    } else {
      setItems(previousItems);
      toast.error("Failed to update status");
    }
  };

  const handleHistoryClick = (patient) => openModal('HISTORY', patient);
  const handleVitalsClick = (patient) => openModal('VITALS', patient);

  const handleAIComplete = (updatedPatientData) => {
    if (updatedPatientData) {
      handleDataUpdate(updatedPatientData);
    }
    refreshPatients();
  };

  const handlePin = async (patient) => {
    const newPinned = !patient.isPinned;
    // Optimistic update
    setItems(prev => prev.map(p => p._id === patient._id ? { ...p, isPinned: newPinned } : p));

    const success = await updatePatient(patient._id, { isPinned: newPinned });
    if (!success) {
      // Revert if failed
      setItems(prev => prev.map(p => p._id === patient._id ? { ...p, isPinned: !newPinned } : p));
      toast.error("Failed to update pin status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* --- Unified Modals --- */}
      <DeleteModal
        isOpen={activeModal.type === 'DELETE'}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        title="Delete Patient?"
        description="Are you sure you want to delete this patient? The patient will be removed from the waitlist."
      />

      <AIAnalysisModal
        isOpen={activeModal.type === 'AI'}
        onClose={closeModal}
        patient={activeModal.patient}
        onAnalysisComplete={handleAIComplete}
      />

      <EditPatientModal
        isOpen={activeModal.type === 'EDIT'}
        onClose={closeModal}
        patient={activeModal.patient}
        onUpdateSuccess={handleDataUpdate}
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
        onUpdateSuccess={handleDataUpdate}
      />
      <PatientHistoryModal
        isOpen={activeModal.type === 'HISTORY'}
        onClose={closeModal}
        patient={activeModal.patient}
      />

      <main className="max-w-[1600px] mx-auto p-6">

        {/* --- Actions --- */}
        <DashboardActions
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onAddClick={handleAddPatient}
        />

        {/* --- Top Stats Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            icon={<Clock className="w-6 h-6" />}
            count={items.filter(p => p.status === PATIENT_STATUS.WAITING).length}
            title="Awaiting Triage"
            theme="yellow"
          />
          <StatusCard
            icon={<Stethoscope className="w-6 h-6" />}
            count={items.filter(p => p.status === PATIENT_STATUS.TRIAGED).length}
            title="Triaged"
            theme="green"
          />
          <StatusCard
            icon={<Activity className="w-6 h-6" />}
            count={items.length}
            title="Total Patients"
          />
        </div>

        {/* --- Main Content Grid --- */}
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* --- Left Column: Unscheduled (4 cols) --- */}
            <div className="lg:col-span-6 flex flex-col gap-6">

              {/* Custom Header for Unscheduled */}
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Unscheduled</h3>
                    <p className="text-xs text-gray-500">Awaiting triage assessment</p>
                  </div>
                </div>
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold text-sm">
                  {sortedUnscheduled.length}
                </div>
              </div>

              <DroppableContainer id="unscheduled-container" className="space-y-4 min-h-[500px]">
                <SortableContext items={sortedUnscheduled.map(p => p._id)} strategy={verticalListSortingStrategy}>
                  {isLoading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-teal-600" /></div>
                  ) : sortedUnscheduled.map(patient => (
                    <SortablePatientCard
                      key={patient._id}
                      patient={patient}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onHistory={handleHistoryClick}
                      onVitals={handleVitalsClick}
                      onPin={handlePin}
                    />
                  ))}
                  {!isLoading && sortedUnscheduled.length === 0 && (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-2xl bg-white">
                      No unscheduled patients
                    </div>
                  )}
                </SortableContext>
              </DroppableContainer>
            </div>


            {/* --- Right Column: Scheduled / Triaged (8 cols) --- */}
            <div className="lg:col-span-6 flex flex-col gap-6">

              {/* Custom Header for Scheduled */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Scheduled / Triaged</h3>
                    <p className="text-xs text-gray-500">AI-prioritized • Drag to reorder</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg font-bold text-xs border border-red-100 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> 3 Critical
                  </div>
                  <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-bold text-sm border border-teal-100">
                    {filteredScheduled.length}
                  </div>
                </div>
              </div>

              <DroppableContainer
                id="scheduled-container"
                className={`space-y-4 min-h-[500px] transition-all`}
              >
                <SortableContext items={sortedScheduled.map(p => p._id)} strategy={verticalListSortingStrategy}>
                  {sortedScheduled.map(patient => (
                    <SortablePatientCard
                      key={patient._id}
                      patient={patient}
                      useTriagedCard={true}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onClick={() => openModal('TREATMENT', patient)}
                      onVitals={handleVitalsClick}
                      onPin={handlePin}
                    />
                  ))}

                  {sortedScheduled.length === 0 && (
                    <div className="mt-4 w-full h-[400px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-4 bg-white/50">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                        <UserPlus className="w-8 h-8 text-gray-300" />
                      </div>
                      <p>Drag patients here from the Unscheduled list</p>
                    </div>
                  )}
                </SortableContext>
              </DroppableContainer>
            </div>

          </div>

          <DragOverlay>
            {activePatient ? (
              <div className="w-[400px]">
                <PatientCard patient={activePatient} isOverlay />
              </div>
            ) : null}
          </DragOverlay>

        </DndContext>
      </main>

      {/* Floating Action Button */}


    </div>
  );
}
