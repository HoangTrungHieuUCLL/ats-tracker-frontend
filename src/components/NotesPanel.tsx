import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { addNote, deleteNote, updateNote } from "../api/jobs"
import type { JobNote } from "../api/types"

function NoteItem({ jobId, note }: { jobId: string; note: JobNote }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(note.body)

  const updateMutation = useMutation({
    mutationFn: () => updateNote(note.id, body),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ["job", jobId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(note.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", jobId] }),
  })

  return (
    <div className="border border-slate-200 rounded-md p-2">
      <p className="text-xs text-slate-400 mb-1">
        {new Date(note.created_at).toLocaleString()}
      </p>
      {editing ? (
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm mb-1"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="text-xs text-red-600 underline"
            >
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-slate-500">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.body}</p>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-red-600 underline">
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-xs text-red-600 underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NotesPanel({ jobId, notes }: { jobId: string; notes: JobNote[] }) {
  const queryClient = useQueryClient()
  const [newBody, setNewBody] = useState("")

  const addMutation = useMutation({
    mutationFn: () => addNote(jobId, newBody),
    onSuccess: () => {
      setNewBody("")
      queryClient.invalidateQueries({ queryKey: ["job", jobId] })
    },
  })

  return (
    <div className="space-y-3">
      <div>
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          rows={2}
          placeholder="Add a note…"
          className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || newBody.trim().length === 0}
          className="mt-1 px-3 py-1 text-xs rounded-md bg-black text-white disabled:opacity-50"
        >
          Add note
        </button>
      </div>
      <div className="space-y-2">
        {notes.map((note) => (
          <NoteItem key={note.id} jobId={jobId} note={note} />
        ))}
      </div>
    </div>
  )
}
