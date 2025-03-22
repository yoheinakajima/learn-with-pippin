import React from 'react';
import { 
  Star, 
  Coins, 
  Zap, 
  ArrowRight, 
  Gift, 
  Award, 
  Map, 
  Trophy,
  Timer,
  Globe
} from 'lucide-react';
import { Item } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { PippinHint, FloatingPippinHint } from '@/components/ui/pippin-hint';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: {
    xp: number;
    coins: number;
    levelUp: boolean;
    newLevel?: number;
    specialItem?: Item;
    timeBonus?: number;
    unlockNextZone?: boolean;
  };
  zoneName: string;
  nextZoneName?: string;
  isPartOfMasterMap?: boolean;
  onReturnToMasterMap?: () => void;
  isReturningToMasterMap?: boolean;
}

export function RewardsModal({ 
  isOpen, 
  onClose, 
  rewards, 
  zoneName, 
  nextZoneName,
  isPartOfMasterMap,
  onReturnToMasterMap,
  isReturningToMasterMap
}: RewardsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-b from-yellow-50 to-white">
        <DialogHeader className="pt-8 px-6 bg-gradient-to-r from-yellow-200 to-amber-200">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center mx-auto -mt-16 mb-4 shadow-lg">
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
            <div className="absolute -right-4 bottom-2">
              <PippinHint 
                hint="Magical job! You've mastered this zone and earned spectacular rewards!"
                size="md"
                isModal={true}
              />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {zoneName} Complete!
          </DialogTitle>
          <p className="text-center text-gray-700 mt-1">
            You've conquered all challenges in this area!
          </p>
        </DialogHeader>

        <div className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Gift className="h-5 w-5 mr-2 text-primary" />
            Rewards Earned
          </h3>

          <div className="space-y-4">
            {/* XP Reward */}
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
              >
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Experience Points</div>
                    <div className="text-sm text-gray-600">Power up your knowledge</div>
                  </div>
                </div>
                <Badge className="text-lg bg-blue-500 hover:bg-blue-500">+{rewards.xp} XP</Badge>
              </motion.div>
            </AnimatePresence>

            {/* Coins Reward */}
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200"
              >
                <div className="flex items-center">
                  <div className="bg-yellow-500 p-2 rounded-full mr-3">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Magic Coins</div>
                    <div className="text-sm text-gray-600">Currency for magical items</div>
                  </div>
                </div>
                <Badge className="text-lg bg-yellow-500 hover:bg-yellow-500">+{rewards.coins}</Badge>
              </motion.div>
            </AnimatePresence>

            {/* Level Up */}
            {rewards.levelUp && (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-500 p-2 rounded-full mr-3">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Level Up!</div>
                      <div className="text-sm text-gray-600">You reached level {rewards.newLevel}</div>
                    </div>
                  </div>
                  <Badge className="text-lg bg-purple-500 hover:bg-purple-500">
                    New Level!
                  </Badge>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Time Bonus */}
            {rewards.timeBonus && (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200"
                >
                  <div className="flex items-center">
                    <div className="bg-green-500 p-2 rounded-full mr-3">
                      <Timer className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Quick Completion Bonus</div>
                      <div className="text-sm text-gray-600">Extra rewards for speedy learning</div>
                    </div>
                  </div>
                  <Badge className="text-lg bg-green-500 hover:bg-green-500">+{rewards.timeBonus}%</Badge>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Special Item */}
            {rewards.specialItem && (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-200"
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-500 p-2 rounded-full mr-3">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{rewards.specialItem.name}</div>
                      <div className="text-sm text-gray-600">
                        {rewards.specialItem.rarity} item
                      </div>
                    </div>
                  </div>
                  <div className="h-10 w-10 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-white text-xs">NEW!</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* New Zone Unlocked */}
            {rewards.unlockNextZone && nextZoneName && (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center justify-between bg-teal-50 p-3 rounded-lg border border-teal-200"
                >
                  <div className="flex items-center">
                    <div className="bg-teal-500 p-2 rounded-full mr-3">
                      <Map className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">New Area Unlocked!</div>
                      <div className="text-sm text-gray-600">{nextZoneName}</div>
                    </div>
                  </div>
                  <Badge className="text-lg bg-teal-500 hover:bg-teal-500">
                    <ArrowRight className="h-4 w-4" />
                  </Badge>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 flex flex-col gap-2">
          {/* Return to Master Map button if this zone is part of a master map */}
          {isPartOfMasterMap && onReturnToMasterMap && (
            <Button 
              onClick={onReturnToMasterMap} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isReturningToMasterMap}
            >
              {isReturningToMasterMap ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Returning to Master Map...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Return to Master Map
                </>
              )}
            </Button>
          )}
          
          {/* Show different button text based on next zone or part of master map */}
          <Button 
            onClick={onClose} 
            className={`w-full ${isPartOfMasterMap ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary/90'}`}
          >
            {rewards.unlockNextZone && nextZoneName && !isPartOfMasterMap ? (
              <>Explore New Area <ArrowRight className="ml-2 h-4 w-4" /></>
            ) : (
              <>Continue Adventure <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </DialogFooter>
        
        {/* Floating Pippin Guide */}
        <FloatingPippinHint 
          hint={
            isPartOfMasterMap
              ? "Click 'Return to Master Map' to go back to your adventure map with your new rewards and key!"
              : "Celebrate your success! You've earned magical rewards that will help you on your journey."
          } 
        />
      </DialogContent>
    </Dialog>
  );
}