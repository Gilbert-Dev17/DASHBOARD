"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"

export function ResponsiveDialog({
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & React.ComponentProps<typeof Drawer>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <Drawer {...props}>{children}</Drawer>
  }

  return <Dialog {...props}>{children}</Dialog>
}

export function ResponsiveDialogTrigger({
  children,
  asChild,
  ...props
}: any) {
  const isMobile = useIsMobile()

  if (isMobile) {
    if (asChild && React.isValidElement(children)) {
      return <DrawerTrigger render={children} {...props} />
    }
    return <DrawerTrigger {...props}>{children}</DrawerTrigger>
  }

  return <DialogTrigger asChild={asChild} {...props}>{children}</DialogTrigger>
}

export function ResponsiveDialogContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogContent> & React.ComponentProps<typeof DrawerContent>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerContent className={cn("px-4 pb-4 pt-2", className)} {...props}>
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  )
}

export function ResponsiveDialogHeader({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader> & React.ComponentProps<typeof DrawerHeader>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerHeader className={className} {...props}>
        {children}
      </DrawerHeader>
    )
  }

  return (
    <DialogHeader className={className} {...props}>
      {children}
    </DialogHeader>
  )
}

export function ResponsiveDialogTitle({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle> & React.ComponentProps<typeof DrawerTitle>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerTitle className={className} {...props}>
        {children}
      </DrawerTitle>
    )
  }

  return (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  )
}

export function ResponsiveDialogDescription({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription> & React.ComponentProps<typeof DrawerDescription>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerDescription className={className} {...props}>
        {children}
      </DrawerDescription>
    )
  }

  return (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  )
}

export function ResponsiveDialogFooter({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter> & React.ComponentProps<typeof DrawerFooter>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerFooter className={className} {...props}>
        {children}
      </DrawerFooter>
    )
  }

  return (
    <DialogFooter className={className} {...props}>
      {children}
    </DialogFooter>
  )
}

export function ResponsiveDialogClose({
  children,
  asChild,
  ...props
}: any) {
  const isMobile = useIsMobile()

  if (isMobile) {
    if (asChild && React.isValidElement(children)) {
      return <DrawerClose render={children} {...props} />
    }
    return <DrawerClose {...props}>{children}</DrawerClose>
  }

  return <DialogClose asChild={asChild} {...props}>{children}</DialogClose>
}
