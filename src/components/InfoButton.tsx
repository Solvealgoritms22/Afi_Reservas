import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export function InfoButton({ logic }: { logic: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="absolute top-2 right-2 text-slate-500 hover:text-slate-300">
          <Info className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-b border-slate-700">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-slate-200">Información</h4>
            <p className="text-sm text-slate-500">
              {logic}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}