import { cn } from '@/lib/utils'
import React, { HTMLAttributes } from 'react'

interface SectionProp extends HTMLAttributes<HTMLDivElement> {
    
}


const Section = ({className,children}:SectionProp) => {
  return (
    <section className={cn("min-h-[90vh]",className)}>
      {children}
    </section>
  )
}

export default Section
