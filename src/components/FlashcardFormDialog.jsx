import { useState, useEffect } from 'react'
import { Plus, X, Save, Trash2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { useFlashcardContext } from '@/context/FlashcardContext'
import { useAudioContext } from '@/context/AudioContext'
import { getTagEmoji } from '@/utils/constants'

/**
 * Shared dialog for creating or editing flashcards
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onOpenChange - Callback when dialog open state changes
 * @param {Object} props.initialCard - Card data for editing (null/undefined for new card)
 * @param {string} props.mode - 'create' or 'edit'
 */
export const FlashcardFormDialog = ({ isOpen, onOpenChange, initialCard = null, mode = 'create' }) => {
  const { createFlashcard, updateFlashcard, deleteFlashcard } = useFlashcardContext()
  const { playAudio } = useAudioContext()
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(mode === 'create')
  const [newTag, setNewTag] = useState('')
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false)
  const [formData, setFormData] = useState({
    vietnamese: '',
    english: '',
    example: '',
    exampleTranslation: '',
    tags: [],
    notes: ''
  })

  // Initialize form data when dialog opens or initialCard changes
  useEffect(() => {
    if (mode === 'create') {
      setIsEditMode(true)
      setFormData({
        vietnamese: '',
        english: '',
        example: '',
        exampleTranslation: '',
        tags: [],
        notes: ''
      })
    } else if (initialCard) {
      setIsEditMode(false)
      setFormData({
        vietnamese: initialCard.vietnamese || '',
        english: initialCard.english || '',
        example: initialCard.example || '',
        exampleTranslation: initialCard.exampleTranslation || '',
        tags: initialCard.tags || [],
        notes: initialCard.notes || ''
      })
    }
  }, [initialCard, mode, isOpen])

  const handleAddTag = () => {
    if (!newTag.trim()) return
    const tag = newTag.trim().toLowerCase()
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleSave = async () => {
    // Validation
    if (!formData.vietnamese.trim() || !formData.english.trim()) {
      alert('Please fill in both Vietnamese and English fields')
      return
    }

    if (formData.tags.length === 0) {
      alert('Please add at least one tag')
      return
    }

    setIsSaving(true)

    if (mode === 'create') {
      const result = await createFlashcard(formData)
      if (result.success) {
        onOpenChange(false)
      } else {
        alert(`Error creating flashcard: ${result.error}`)
      }
    } else {
      const result = await updateFlashcard(initialCard.id, formData)
      if (result.success) {
        setIsEditMode(false)
      } else {
        alert(`Error updating flashcard: ${result.error}`)
      }
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!initialCard) return
    const result = await deleteFlashcard(initialCard.id)
    if (result.success) {
      onOpenChange(false)
    } else {
      alert(`Error deleting flashcard: ${result.error}`)
    }
  }

  const handleCancel = () => {
    if (mode === 'create') {
      onOpenChange(false)
    } else {
      // Reset to initial card data
      if (initialCard) {
        setFormData({
          vietnamese: initialCard.vietnamese || '',
          english: initialCard.english || '',
          example: initialCard.example || '',
          exampleTranslation: initialCard.exampleTranslation || '',
          tags: initialCard.tags || [],
          notes: initialCard.notes || ''
        })
      }
      setIsEditMode(false)
    }
  }

  const handleClose = () => {
    if (mode === 'edit' && isEditMode) {
      // If in edit mode, reset to view mode instead of closing
      handleCancel()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            {mode === 'create' ? (
              'Create New Flashcard'
            ) : (
              <>
                {formData.vietnamese}
                {!isEditMode && (
                  <Button
                    onClick={() => playAudio(formData.vietnamese)}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vietnamese */}
          <div className="flex flex-col gap-3">
            {isEditMode && (
              <Label htmlFor="vietnamese">
                Vietnamese <span className="text-destructive">*</span>
              </Label>
            )}
            {isEditMode ? (
              <Input
                id="vietnamese"
                value={formData.vietnamese}
                onChange={(e) => setFormData({ ...formData, vietnamese: e.target.value })}
                placeholder="Enter Vietnamese word or phrase..."
              />
            ) : null}
          </div>

          {/* English */}
          <div className="flex flex-col gap-3">
              <Label htmlFor="english">
                English {isEditMode ? <span className="text-destructive">*</span> : null}
              </Label>
            {isEditMode ? (
              <Input
                id="english"
                value={formData.english}
                onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                placeholder="Enter English translation..."
              />
            ) : (
              <p className="text-xl">{formData.english}</p>
            )}
          </div>

          {/* Example */}
          <div className="flex flex-col gap-3">
            {isEditMode ? (
              <Textarea
                id="example"
                value={formData.example || ''}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                placeholder="Add an example sentence in Vietnamese..."
              />
            ) : formData.example ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">Example:</p>
                    <p className="text-base italic mb-2">{formData.example}</p>
                  </div>
                  <Button
                    onClick={() => playAudio(formData.example)}
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
          <div className="flex flex-col gap-3">
            {isEditMode ? (
              <Textarea
                id="exampleTranslation"
                value={formData.exampleTranslation || ''}
                onChange={(e) => setFormData({ ...formData, exampleTranslation: e.target.value })}
                placeholder="Add the English translation of the example..."
              />
            ) : formData.exampleTranslation ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">Translation:</p>
                <p className="text-base italic text-gray-600 dark:text-gray-400">{formData.exampleTranslation}</p>
              </div>
            ) : null}
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            {isEditMode ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
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
                <div className="flex gap-2 items-center">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddTag} size="sm" type="button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {getTagEmoji(tag)} {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-4">
            {isEditMode ? (
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add personal notes about this card..."
                rows={3}
              />
            ) : formData.notes ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{formData.notes}</p>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-6">
          {/* Delete button (only in edit mode) */}
          {mode === 'edit' && (
            <Popover open={deletePopoverOpen} onOpenChange={setDeletePopoverOpen}>
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
                    <Button variant="outline" size="sm" onClick={() => setDeletePopoverOpen(false)}>
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
          )}

          {/* Right side buttons */}
          <div className="flex gap-2 ml-auto">
            {mode === 'edit' && !isEditMode ? (
              <Button onClick={() => setIsEditMode(true)} size="sm">
                <X className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                {mode === 'edit' && (
                  <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create' : 'Save')}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
