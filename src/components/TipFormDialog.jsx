import { useState, useEffect } from 'react'
import { Plus, X, Save, Trash2, Eye } from 'lucide-react'
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
import { useTips } from '@/context/TipsContext'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Shared dialog for creating or editing tips
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onOpenChange - Callback when dialog open state changes
 * @param {Object} props.initialTip - Tip data for editing (null/undefined for new tip)
 * @param {string} props.mode - 'create' or 'edit'
 */
export const TipFormDialog = ({ isOpen, onOpenChange, initialTip = null, mode = 'create' }) => {
  const { createTip, updateTip, deleteTip } = useTips()
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: []
  })

  // Initialize form data when dialog opens or initialTip changes
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: []
      })
    } else if (initialTip) {
      setFormData({
        title: initialTip.title || '',
        content: initialTip.content || '',
        category: initialTip.category || '',
        tags: initialTip.tags || []
      })
    }
    // Reset preview mode when dialog opens
    setShowPreview(false)
  }, [initialTip, mode, isOpen])

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
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content fields')
      return
    }

    setIsSaving(true)

    if (mode === 'create') {
      const result = await createTip(formData)
      if (result.success) {
        onOpenChange(false)
      } else {
        alert(`Error creating tip: ${result.error}`)
      }
    } else {
      const result = await updateTip(initialTip.id, formData)
      if (result.success) {
        onOpenChange(false)
      } else {
        alert(`Error updating tip: ${result.error}`)
      }
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!initialTip) return
    const result = await deleteTip(initialTip.id)
    if (result.success) {
      onOpenChange(false)
    } else {
      alert(`Error deleting tip: ${result.error}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Tip' : 'Edit Tip'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a clear, concise title..."
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">
                Content <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>

            {!showPreview ? (
              <>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Use markdown formatting:&#10;&#10;**bold text**&#10;&#10;Lists need a blank line before:&#10;- bullet point&#10;- another bullet&#10;&#10;Example: 'đi bác sĩ' (go see doctor)"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Supports markdown: **bold**, bullet lists (- item). <strong>Important:</strong> Add a blank line before lists!
                </p>
              </>
            ) : (
              <div className="min-h-48 p-4 border rounded-md bg-muted/30">
                <div className="prose prose-sm max-w-none prose-gray dark:prose-invert">
                  {formData.content ? (
                    <Markdown remarkPlugins={[remarkGfm]}>{formData.content}</Markdown>
                  ) : (
                    <p className="text-muted-foreground italic">Preview will appear here...</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., grammar, vocabulary, pronunciation..."
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <Label>Tags (optional)</Label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} <X className="w-3 h-3 ml-1" />
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
                  <h4 className="font-semibold">Delete this tip?</h4>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. The tip will be permanently deleted from the database.
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
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create' : 'Save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
