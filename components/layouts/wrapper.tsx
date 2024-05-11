import { cn } from "@/lib/utils";
import React, { HTMLAttributes } from "react";

interface WrapperProp extends HTMLAttributes<HTMLDivElement> {}

const Wrapper = ({ className, children }: WrapperProp) => {
  return <div className={cn("container", className)}>{children}</div>;
};

export default Wrapper;
