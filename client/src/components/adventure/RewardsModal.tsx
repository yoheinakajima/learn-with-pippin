import { useState } from "react";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Coins, 
  Trophy, 
  Star, 
  Medal, 
  BadgeCheck, 
  Gift,
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
}

export function RewardsModal({ isOpen, onClose, rewards, zoneName, nextZoneName }: RewardsModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const totalSteps = rewards.specialItem ? 3 : 2;

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Reset and close
      setCurrentStep(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Rewards Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-600 p-6 text-white">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-bold font-heading">Epic Rewards!</h2>
          </div>
          <p className="text-center opacity-90">
            Congratulations on conquering {zoneName}!
          </p>
          {/* Step indicator */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full ${currentStep === i ? 'bg-white' : 'bg-white bg-opacity-30'}`}
              />
            ))}
          </div>
        </div>

        {/* Reward Content - XP and Coins */}
        {currentStep === 0 && (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Basic Rewards</h3>
              <p className="text-gray-600">You've earned valuable rewards for completing the map!</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* XP Reward */}
              <div className="bg-primary bg-opacity-10 rounded-lg p-4">
                <div className="flex flex-col items-center">
                  <Zap className="h-10 w-10 text-primary mb-1" />
                  <span className="text-2xl font-bold text-primary">+{rewards.xp}</span>
                  <span className="text-sm text-gray-600">Experience Points</span>
                  {rewards.timeBonus && (
                    <Badge variant="outline" className="mt-2 border-primary text-primary flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> +{rewards.timeBonus} Time Bonus
                    </Badge>
                  )}
                </div>
              </div>

              {/* Coins Reward */}
              <div className="bg-yellow-100 rounded-lg p-4">
                <div className="flex flex-col items-center">
                  <Coins className="h-10 w-10 text-yellow-500 mb-1" />
                  <span className="text-2xl font-bold text-yellow-600">+{rewards.coins}</span>
                  <span className="text-sm text-gray-600">Magic Coins</span>
                  {rewards.timeBonus && (
                    <Badge variant="outline" className="mt-2 border-yellow-500 text-yellow-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> +{Math.floor(rewards.timeBonus/2)} Time Bonus
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Level Up Notification */}
            {rewards.levelUp && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-4 mb-6 animate-pulse">
                <div className="flex items-center justify-center">
                  <div className="mr-4">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-1">LEVEL UP!</div>
                    <div>You've reached level {rewards.newLevel}!</div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg"
              onClick={handleNextStep}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Reward Content - Special Item */}
        {currentStep === 1 && rewards.specialItem && (
          <div className="p-6">
            <div className="text-center mb-6">
              <Badge className="mb-3 bg-purple-600 hover:bg-purple-700 text-white">
                {rewards.specialItem.rarity} Item
              </Badge>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Special Item Reward!</h3>
              <p className="text-gray-600">You've earned a magical item for your inventory!</p>
            </div>

            <div className="bg-gradient-to-b from-indigo-50 to-purple-50 rounded-lg p-6 border border-purple-200 mb-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-12 w-12 text-white" />
                </div>
                <h4 className="text-xl font-bold text-purple-800 mb-1">{rewards.specialItem.name}</h4>
                <p className="text-center text-gray-600 mb-4">{rewards.specialItem.description}</p>
                
                <div className="w-full grid grid-cols-3 gap-2 mb-3">
                  {rewards.specialItem.statBoosts.magicPower > 0 && (
                    <Badge variant="outline" className="border-indigo-500 text-indigo-600">
                      +{rewards.specialItem.statBoosts.magicPower} Magic
                    </Badge>
                  )}
                  {rewards.specialItem.statBoosts.wisdom > 0 && (
                    <Badge variant="outline" className="border-blue-500 text-blue-600">
                      +{rewards.specialItem.statBoosts.wisdom} Wisdom
                    </Badge>
                  )}
                  {rewards.specialItem.statBoosts.agility > 0 && (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      +{rewards.specialItem.statBoosts.agility} Agility
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 italic">
                  This item has been added to your inventory!
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg"
              onClick={handleNextStep}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Reward Content - Next Zone Unlock */}
        {currentStep === (rewards.specialItem ? 2 : 1) && (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {rewards.unlockNextZone ? "New Adventure Unlocked!" : "Adventure Complete!"}
              </h3>
              <p className="text-gray-600">
                {rewards.unlockNextZone
                  ? `You've unlocked access to the ${nextZoneName || "next zone"}!`
                  : "You've completed this adventure map!"}
              </p>
            </div>

            {rewards.unlockNextZone && nextZoneName ? (
              <div className="bg-gradient-to-b from-green-50 to-teal-50 rounded-lg p-6 border border-teal-200 mb-6">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mb-4">
                    <BadgeCheck className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-teal-800 mb-2">{nextZoneName}</h4>
                  <p className="text-center text-gray-600 mb-4">
                    A new magical area awaits your discovery! New challenges, lessons, and rewards await.
                  </p>
                  
                  <Badge className="bg-teal-600 hover:bg-teal-700 text-white mb-3">
                    New Adventures Await
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200 mb-6">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                    <Medal className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-amber-800 mb-2">Map Mastery Achieved!</h4>
                  <p className="text-center text-gray-600 mb-4">
                    You've mastered this map! Check back later for new maps and adventures.
                  </p>
                  
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white mb-3">
                    Master Explorer
                  </Badge>
                </div>
              </div>
            )}

            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg"
              onClick={handleNextStep}
            >
              Continue Adventure <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}