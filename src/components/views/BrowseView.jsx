import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'
import { useFlashcardContext } from '@/context/FlashcardContext'
import { useAudioContext } from '@/context/AudioContext'
import { getTagEmoji } from '@/utils/constants'

/**
 * Browse view component - List of all cards with modal details
 */
export const BrowseView = () => {
  const { filteredCards } = useFlashcardContext()
  const { playAudio } = useAudioContext()
  const [selectedCard, setSelectedCard] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRowClick = (card) => {
    setSelectedCard(card)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setTimeout(() => setSelectedCard(null), 200)
  }

  return (
    <>
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

      {/* Modal for card details */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedCard.vietnamese}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Vietnamese with audio */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Vietnamese</p>
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedCard.vietnamese}
                    </h3>
                    <Button
                      onClick={() => playAudio(selectedCard.vietnamese)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Play
                    </Button>
                  </div>
                </div>

                {/* English translation */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">English</p>
                  <p className="text-xl text-gray-700 dark:text-gray-300">{selectedCard.english}</p>
                </div>

                {/* Example sentence */}
                {selectedCard.example && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">Example:</p>
                        <p className="text-base text-gray-700 dark:text-gray-300 italic mb-2">
                          {selectedCard.example}
                        </p>
                        {selectedCard.exampleTranslation && (
                          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">Translation:</p>
                            <p className="text-base text-gray-600 dark:text-gray-400 italic">
                              {selectedCard.exampleTranslation}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => playAudio(selectedCard.example)}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                        Play
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {getTagEmoji(tag)} {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
