"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import { DeleteModal } from "@/components/Modals/DeleteModal";
import { AIAnalysisModal } from "@/components/Modals/AIAnalysisModal";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Menu, 
  GripHorizontal, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
} from "lucide-react";

// --- Droppable Container Helper ---
function DroppableContainer({ id, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`${className} ${isOver ? 'ring-2 ring-teal-500 bg-teal-50/50' : ''}`}
    >
      {children}
    </div>
  );
}

// --- Sortable Item Component ---
function SortablePatientCard({ patient, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: patient._id, data: { patient } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 touch-none">
      <PatientCard 
        patient={patient} 
        onEdit={(p) => onEdit(p)} 
        onDelete={(p) => onDelete(p)} 
        // ai drag props for the whole card
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// --- Patient Card Component ---
const PatientCard = ({ patient, onEdit, onDelete, dragHandleProps, isOverlay }) => {
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const calculateWaitTime = (registeredAt) => {
    if (!registeredAt) return 0;
    const diff = (Date.now() - new Date(registeredAt).getTime()) / 60000;
    return Math.floor(diff);
  };

  const age = calculateAge(patient.dateOfBirth);
  const waitTime = calculateWaitTime(patient.registeredAt);
  const hasVitals = patient.vitalSigns && Object.keys(patient.vitalSigns).length > 0;
  const isHighPain = (patient.painLevel || 0) > 6;
  
  return (
    <Card 
      {...dragHandleProps} // Applied to the entire card
      className={`p-4 border shadow-sm transition-all group relative
        cursor-grab active:cursor-grabbing hover:border-teal-400
        ${isOverlay ? 'shadow-2xl rotate-2 scale-105 bg-white border-teal-500' : 'bg-white border-gray-100'}
      `}
    >
      <div className="flex gap-3">
        {/* Visual Grip Handle (Optional, kept for affordance but not required to click) */}
        <div className="mt-1 text-gray-300 group-hover:text-teal-500 transition-colors">
          <GripHorizontal className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {patient.fullName} <span className="text-gray-400 font-normal text-sm ml-1">({age}y, {patient.gender})</span>
              </h3>
            </div>
            
            {hasVitals ? (
              <Badge variant="outline" className="bg-teal-50 text-teal-600 border-teal-200 text-[10px] px-2 py-0.5 font-medium flex gap-1 items-center">
                <CheckCircle className="w-3 h-3" /> Vitals provided
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200 text-[10px] px-2 py-0.5 font-medium flex gap-1 items-center">
                <AlertCircle className="w-3 h-3" /> Missing Vitals
              </Badge>
            )}
          </div>

          {/* Symptoms */}
          <div className="text-sm text-gray-600 mb-3 flex gap-2">
             <span className="font-semibold text-gray-900 shrink-0">=</span >
             <span className="font-semibold text-gray-700 shrink-0">Symptoms:</span>
             <span className="truncate">{patient.symptoms}</span>
          </div>

          {/* Footer Stats & Actions */}
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <Badge variant="secondary" className={`${isHighPain ? 'bg-red-100 text-red-700' : 'bg-teal-50 text-teal-700'} border-transparent rounded px-2`}>
                   Pain: {patient.painLevel}/10
                </Badge>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100 rounded px-2">
                   Wait time: {waitTime} minutes
                </Badge>
             </div>

             {/* Action Buttons with Stop Propagation */}
             <div className="flex gap-1 relative z-10">
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={(e) => { e.stopPropagation(); onEdit?.(patient); }} 
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(patient); }} 
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- Main Dashboard Component ---
export default function NurseDashboard() {
  const router = useRouter();
  
  // State
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    patient: null,
  });

  // AI Modal State
  const [aiModal, setAiModal] = useState({
    isOpen: false,
    patient: null,
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch Data
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/patients?limit=100&sortBy=registeredAt&sortOrder=desc');
      const data = await response.json();
      if (data.success) {
        setItems(data.data.patients || []);
      }
    } catch (error) {
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter Items
  const unscheduledItems = items.filter(p => p.status === 'Waiting');
  // Anything not waiting is considered scheduled/triaged
  const scheduledItems = items.filter(p => p.status !== 'Waiting');

  const filteredUnscheduled = unscheduledItems.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredScheduled = scheduledItems.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Drag End Handler
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

    if (draggedItem.status === 'Waiting' && isOverScheduled) {
       newStatus = 'Triaged';
       shouldTriggerAI = true; // Trigger AI only for Left -> Right
    } else if (draggedItem.status !== 'Waiting' && isOverUnscheduled) {
       newStatus = 'Waiting';
    }

    if (newStatus && newStatus !== draggedItem.status) {
      // Optimistic Update
      setItems(prev => prev.map(p => 
        p._id === patientId ? { ...p, status: newStatus } : p
      ));

      // Trigger AI Modal immediately for better UX
      if (shouldTriggerAI) {
        // Calculate wait time for the modal display
        const waitTime = draggedItem.registeredAt ? 
          Math.floor((Date.now() - new Date(draggedItem.registeredAt).getTime()) / 60000) : 0;
          
        setAiModal({
          isOpen: true,
          patient: { ...draggedItem, waitTime }, // Pass calculated stat
        });
      }

      try {
        await fetch(`/api/patients/${patientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        toast.success(newStatus === 'Triaged' ? 'Moved to Scheduled' : 'Moved back to Unscheduled');
      } catch (error) {
        toast.error("Failed to move patient");
        setItems(previousItems); 
      }
    }
  };

  const handleDragStart = (event) => setActiveId(event.active.id);
  const activePatient = items.find(p => p._id === activeId);

  // Actions
  const handleAddPatient = () => router.push("/nurse/add-patient");
  
  const handleDeleteClick = (patient) => {
    setDeleteModal({
      isOpen: true,
      patient: patient,
    });
  };

  const verifyDelete = async () => {
    const patient = deleteModal.patient;
    if (!patient) return;

    try {
       await fetch(`/api/patients/${patient._id}`, { method: 'DELETE' });
       setItems(prev => prev.filter(p => p._id !== patient._id));
       toast.success("Patient deleted");
       setDeleteModal({ isOpen: false, patient: null });
    } catch(e) {
      toast.error("Could not delete");
    }
  };

  const handleEdit = (patient) => {
    router.push(`/nurse/edit-patient/${patient._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, patient: null })}
        onConfirm={verifyDelete}
        title="Delete Patient?"
        description="Are you sure you want to delete this patient? The patient will be removed from the waitlist. This action cannot be undone."
      />

      {/* AI Analysis Modal */}
      <AIAnalysisModal 
        isOpen={aiModal.isOpen}
        onClose={() => setAiModal({ isOpen: false, patient: null })}
        patient={aiModal.patient}
      />

      {/* Header */}
      <header className="bg-teal-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="bg-white rounded-full py-1.5 px-3 shadow-sm">
             <span className="text-teal-600 font-bold">Med</span>
             <span className="text-teal-400 font-bold">Flow</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Triage Dashboard</h1>
            <p className="text-teal-100 text-xs opacity-90">Manage patients in the ER</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-teal-700">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        
        {/* Actions */}
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
