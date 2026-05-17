import * as DM from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export const DropdownMenuGroup = DM.Group;
export const DropdownMenuPortal = DM.Portal;
export const DropdownMenuSub = DM.Sub;
export const DropdownMenuRadioGroup = DM.RadioGroup;

export const DropdownMenuContent = forwardRef<
  React.ElementRef<typeof DM.Content>,
  React.ComponentPropsWithoutRef<typeof DM.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DM.Portal>
    <DM.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "hx-glass z-50 min-w-[12rem] overflow-hidden rounded-xl p-1.5",
        "data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    />
  </DM.Portal>
));
DropdownMenuContent.displayName = DM.Content.displayName;

export const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof DM.Item>,
  React.ComponentPropsWithoutRef<typeof DM.Item>
>(({ className, ...props }, ref) => (
  <DM.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 px-2.5 py-2",
      "rounded-md text-[13px] text-ink-muted outline-none transition-colors",
      "focus:bg-gradient-to-r focus:from-white/[0.07] focus:to-white/[0.02] focus:text-ink",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DM.Item.displayName;

export const DropdownMenuLabel = forwardRef<
  React.ElementRef<typeof DM.Label>,
  React.ComponentPropsWithoutRef<typeof DM.Label>
>(({ className, ...props }, ref) => (
  <DM.Label
    ref={ref}
    className={cn(
      "px-2.5 py-1.5 text-2xs uppercase tracking-tightish text-ink-subtle font-semibold",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DM.Label.displayName;

export const DropdownMenuSeparator = forwardRef<
  React.ElementRef<typeof DM.Separator>,
  React.ComponentPropsWithoutRef<typeof DM.Separator>
>(({ className, ...props }, ref) => (
  <DM.Separator
    ref={ref}
    className={cn("my-1 h-px bg-line", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DM.Separator.displayName;

export const DropdownMenuRadioItem = forwardRef<
  React.ElementRef<typeof DM.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DM.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DM.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 px-2.5 py-2 pr-8",
      "rounded-md text-[13px] text-ink-muted outline-none transition-colors",
      "focus:bg-gradient-to-r focus:from-white/[0.07] focus:to-white/[0.02] focus:text-ink",
      "data-[state=checked]:text-ink",
      className,
    )}
    {...props}
  >
    {children}
    <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
      <DM.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-accent" />
      </DM.ItemIndicator>
    </span>
  </DM.RadioItem>
));
DropdownMenuRadioItem.displayName = DM.RadioItem.displayName;
