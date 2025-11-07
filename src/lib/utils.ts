import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFacultyName(facultyCode: string): string {
  if (!facultyCode) return "Faculty not specified";
  
  if (facultyCode.startsWith("Faculty of")) {
    return facultyCode;
  }
  
  const facultyMap: Record<string, string> = {
    "tec": "Faculty of Technology",
    "app": "Faculty of Applied Sciences",
    "ssh": "Faculty of Social Sciences & Humanities",
    "mgt": "Faculty of Management Studies",
    "agr": "Faculty of Agriculture",
    "med": "Faculty of Medicine and Allied Sciences"
  };
  
  return facultyMap[facultyCode.toLowerCase()] || facultyCode;
}
