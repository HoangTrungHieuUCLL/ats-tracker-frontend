import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { addNote, deleteNote, updateNote } from "../api/jobs"
import type { JobNote } from "../api/types"
import { BTN_PRIMARY, BTN_TEXT, BTN_TEXT_MUTED, INPUT } from "../styles/ui"

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
    <div className="border border-brand rounded-sm p-2">
      <p className="text-xs text-slate-400 mb-1">
        {new Date(note.created_at).toLocaleString()}
      </p>
      {editing ? (
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className={`w-full ${INPUT} py-1 mb-1`}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className={`text-xs ${BTN_TEXT}`}
            >
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className={`text-xs ${BTN_TEXT_MUTED}`}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.body}</p>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setEditing(true)} className={`text-xs ${BTN_TEXT}`}>
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className={`text-xs ${BTN_TEXT}`}
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
          className={`w-full ${INPUT} py-1`}
        />
        <button
          type="button"
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || newBody.trim().length === 0}
          className={`mt-1 ${BTN_PRIMARY} px-3 py-1 text-xs`}
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
