'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useGetBatchesQuery,
  useAddBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation
} from '@/features/erp/erpApi';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

function BatchesPageContent() {
  const searchParams = useSearchParams();
  const { data: batches = [], isLoading } = useGetBatchesQuery();
  const [addBatch, { isLoading: isAdding }] = useAddBatchMutation();
  const [updateBatch, { isLoading: isUpdating }] = useUpdateBatchMutation();
  const [deleteBatch, { isLoading: isDeleting }] = useDeleteBatchMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [deletingBatch, setDeletingBatch] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [shift, setShift] = useState('Day');
  const [roomNo, setRoomNo] = useState('');
  const [status, setStatus] = useState('active');

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setName('');
    setShift('Day');
    setRoomNo('');
    setStatus('active');
    setIsModalOpen(true);
  };

  // Trigger modal open if URL search params specify ?add=true
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      handleOpenAdd();
    }
  }, [searchParams]);

  const handleOpenEdit = (batch: any) => {
    setEditingBatch(batch);
    setName(batch.name);
    setShift(batch.shift);
    setRoomNo(batch.roomNo);
    setStatus(batch.status);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (batch: any) => {
    setDeletingBatch(batch);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shift || !roomNo) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      if (editingBatch) {
        await updateBatch({
          id: editingBatch._id,
          body: { name, shift, roomNo, status },
        }).unwrap();
        toast.success('Batch updated successfully.');
      } else {
        await addBatch({ name, shift, roomNo, status }).unwrap();
        toast.success('Batch created successfully.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async () => {
    if (!deletingBatch) return;
    try {
      await deleteBatch(deletingBatch._id).unwrap();
      toast.success('Batch deleted successfully.');
      setIsConfirmOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Delete failed.');
    }
  };

  const columns: Column<any>[] = [
    { header: 'Batch Name', accessor: 'name' },
    { header: 'Shift', accessor: 'shift', className: 'font-mono' },
    { header: 'Room Number', accessor: 'roomNo' },
    {
      header: 'Status',
      accessor: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/25' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-550 flex items-center space-x-1.5 mb-1.5">
          <span>Dashboard</span>
          <span>/</span>
          <span>Academic</span>
          <span>/</span>
          <span className="text-zinc-350">Batches</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">Batches Management</h1>
        <p className="text-sm text-zinc-450 mt-1">Manage batches, shifts, and classroom numbers.</p>
      </div>

      <DataTable
        data={batches}
        columns={columns}
        searchField="name"
        searchPlaceholder="Search batch name (e.g. Batch 1)..."
        addButtonLabel="Add Batch"
        onAddClick={handleOpenAdd}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleOpenDelete}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBatch ? 'Edit Batch' : 'Add New Batch'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Batch Name"
            placeholder="e.g. Batch 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full bg-zinc-955 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none"
              required
            >
              <option value="Day">Day</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
          <Input
            label="Room Number"
            placeholder="e.g. Room 101"
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isAdding || isUpdating}
              className="bg-emerald-650 hover:bg-emerald-555 text-white"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function BatchesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-zinc-900 rounded-2xl" />}>
      <BatchesPageContent />
    </Suspense>
  );
}
