import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CategoryFilter } from '@/components/CategoryFilter'
import { FlashcardFormDialog } from '@/components/FlashcardFormDialog'
import { useFlashcardContext } from '@/context/FlashcardContext'
import { getTagEmoji } from '@/utils/constants'

/**
 * Browse view component - List of all cards with modal details and CRUD operations
 */
export const BrowseView = () => {
  const { filteredCards } = useFlashcardContext()
  const [selectedCard, setSelectedCard] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRowClick = (card) => {
    setSelectedCard(card)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setTimeout(() => {
      setSelectedCard(null)
    }, 200)
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

      {/* Flashcard detail/edit dialog */}
      <FlashcardFormDialog
        isOpen={isDialogOpen}
        onOpenChange={handleCloseDialog}
        initialCard={selectedCard}
        mode="edit"
      />
    </>
  )
}
