"use client";

import { motion } from "framer-motion";
import { Play, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onRank: () => void;
  onFinalize: () => void;
  stepping: boolean;
  done: boolean;
}

export default function ActionPanel({ onRank, onFinalize, stepping, done }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Play className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Actions</h3>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRank}
          disabled={stepping || done}
          className={cn(
            "flex-1 btn btn-primary",
            (stepping || done) && "opacity-50 cursor-not-allowed"
          )}
        >
          {stepping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Generate Feed
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onFinalize}
          disabled={stepping}
          className={cn(
            "btn btn-sm bg-success text-success-foreground hover:bg-success/90",
            stepping && "opacity-50 cursor-not-allowed"
          )}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Finish Episode
        </motion.button>
      </div>
    </motion.div>
  );
}