import { useState } from 'react'
import { Volume2, Edit2, Save, X, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CategoryFilter } from '@/components/CategoryFilter'
import { useFlashcardContext } from '@/context/FlashcardContext'
import { useAudioContext } from '@/context/AudioContext'
import { getTagEmoji } from '@/utils/constants'

/**
 * Browse view component - List of all cards with modal details and CRUD operations
 */
export const BrowseView = () => {
  const { filteredCards, updateFlashcard, deleteFlashcard } = useFlashcardContext()
  const { playAudio } = useAudioContext()
  const [selectedCard, setSelectedCard] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedCard, setEditedCard] = useState(null)
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleRowClick = (card) => {
    setSelectedCard(card)
    setEditedCard(card)
    setIsEditMode(false)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditMode(false)
    setTimeout(() => {
      setSelectedCard(null)
      setEditedCard(null)
    }, 200)
  }

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset to original
      setEditedCard(selectedCard)
    }
    setIsEditMode(!isEditMode)
  }

  const handleSave = async () => {
    if (!editedCard) return

    setIsSaving(true)
    const result = await updateFlashcard(editedCard.id, editedCard)

    if (result.success) {
      setSelectedCard(editedCard)
      setIsEditMode(false)
    } else {
      alert(`Error saving: ${result.error}`)
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedCard) return

    const result = await deleteFlashcard(selectedCard.id)

    if (result.success) {
      handleCloseDialog()
    } else {
      alert(`Error deleting: ${result.error}`)
    }
  }

  const handleAddTag = () => {
    if (!newTag.trim() || !editedCard) return
    const tag = newTag.trim().toLowerCase()
    if (!editedCard.tags.includes(tag)) {
      setEditedCard({ ...editedCard, tags: [...editedCard.tags, tag] })
    }
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove) => {
    if (!editedCard) return
    setEditedCard({
      ...editedCard,
      tags: editedCard.tags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <>
      {/* Category filter */}
      <div className="w-full mb-6">
        <CategoryFilter />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Vietnamese</TableHead>
              <TableHead className="w-[30%]">English</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.map(card => (
              <TableRow
                key={card.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleRowClick(card)}
              >
                <TableCell className="font-medium">{card.vietnamese}</TableCell>
                <TableCell>{card.english}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {getTagEmoji(tag)} {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal for card details/editing */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editedCard && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">
                    {isEditMode ? 'Edit Flashcard' : editedCard.vietnamese}
                  </DialogTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEditToggle}
                      variant={isEditMode ? "outline" : "default"}
                      size="sm"
                    >
                      {isEditMode ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Vietnamese */}
                <div className="space-y-2">
                  <Label htmlFor="vietnamese">Vietnamese</Label>
                  {isEditMode ? (
                    <Input
                      id="vietnamese"
                      value={editedCard.vietnamese}
                      onChange={(e) => setEditedCard({ ...editedCard, vietnamese: e.target.value })}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-bold">{editedCard.vietnamese}</h3>
                      <Button
                        onClick={() => playAudio(editedCard.vietnamese)}
                        variant="outline"
                        size="sm"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  )}
                </div>

                {/* English */}
                <div className="space-y-2">
                  <Label htmlFor="english">English</Label>
                  {isEditMode ? (
                    <Input
                      id="english"
                      value={editedCard.english}
                      onChange={(e) => setEditedCard({ ...editedCard, english: e.target.value })}
                      className="text-lg"
                    />
                  ) : (
                    <p className="text-xl">{editedCard.english}</p>
                  )}
                </div>

                {/* Example */}
                <div className="space-y-2">
                  <Label htmlFor="example">Example Sentence (Optional)</Label>
                  {isEditMode ? (
                    <Textarea
                      id="example"
                      value={editedCard.example || ''}
                      onChange={(e) => setEditedCard({ ...editedCard, example: e.target.value })}
                      placeholder="Add an example sentence in Vietnamese..."
                    />
                  ) : editedCard.example ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">Example:</p>
                          <p className="text-base italic mb-2">{editedCard.example}</p>
                        </div>
                        <Button
                          onClick={() => playAudio(editedCard.example)}
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Example Translation */}
                <div className="space-y-2">
                  <Label htmlFor="exampleTranslation">Example Translation (Optional)</Label>
                  {isEditMode ? (
                    <Textarea
                      id="exampleTranslation"
                      value={editedCard.exampleTranslation || ''}
                      onChange={(e) => setEditedCard({ ...editedCard, exampleTranslation: e.target.value })}
                      placeholder="Add the English translation of the example..."
                    />
                  ) : editedCard.exampleTranslation ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">Translation:</p>
                      <p className="text-base italic text-gray-600 dark:text-gray-400">{editedCard.exampleTranslation}</p>
                    </div>
                  ) : null}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {editedCard.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {getTagEmoji(tag)} {tag} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          placeholder="Add new tag..."
                          className="flex-1"
                        />
                        <Button onClick={handleAddTag} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editedCard.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {getTagEmoji(tag)} {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  {isEditMode ? (
                    <Textarea
                      id="notes"
                      value={editedCard.notes || ''}
                      onChange={(e) => setEditedCard({ ...editedCard, notes: e.target.value })}
                      placeholder="Add personal notes about this card..."
                      rows={3}
                    />
                  ) : editedCard.notes ? (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{editedCard.notes}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center mt-6">
                {/* Delete button with confirmation */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Delete this flashcard?</h4>
                      <p className="text-sm text-muted-foreground">
                        This action cannot be undone. The flashcard will be permanently deleted from the database.
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => {}}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                        >
                          Delete Permanently
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Save button (only in edit mode) */}
                {isEditMode && (
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
