import './Table.css';
import React from 'react';
import { cn } from '../../../utils/cn';

export const Table = ({ children, className }) => {
  return (
    <div className={cn("overflow-x-auto w-full", className)}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className }) => {
  return (
    <thead className={cn("bg-black border-b border-[#FFD700]/15 text-sm text-[#BDBDBD] uppercase tracking-wider", className)}>
      <tr>{children}</tr>
    </thead>
  );
};

export const TableBody = ({ children, className }) => {
  return (
    <tbody className={cn("bg-black divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className, onClick }) => {
  return (
    <tr 
      onClick={onClick} 
      className={cn(
        "transition-colors hover:bg-black", 
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className }) => {
  return (
    <th className={cn("px-6 py-4 font-medium", className)}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className }) => {
  return (
    <td className={cn("px-6 py-4 whitespace-nowrap text-sm text-white", className)}>
      {children}
    </td>
  );
};
