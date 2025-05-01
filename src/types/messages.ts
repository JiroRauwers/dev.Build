type messages = get_NoteMessages | update_NoteMessages;

interface get_NoteMessages {
  type: "getNoteData";
}
interface update_NoteMessages {
  type: "updateNotes";
  notes: string[];
}

export type { messages };
