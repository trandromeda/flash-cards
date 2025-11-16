import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TipFormDialog } from '@/components/TipFormDialog'

/**
 * Button that opens dialog for creating a new tip
 */
export const NewTipDialog = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Lightbulb className="w-4 h-4" />
        <span className="hidden sm:inline">New Tip</span>
      </Button>

      <TipFormDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        mode="create"
      />
    </>
  )
}
