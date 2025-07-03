"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CurrentFilters {
  status?: string;
  provider?: string;
  search?: string;
  sortBy: string;
  sortOrder: string;
}

interface InvoiceFiltersProps {
  currentFilters: CurrentFilters;
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "submitted", label: "Submitted", color: "bg-blue-500/20 text-blue-400" },
  { value: "paid", label: "Paid", color: "bg-green-500/20 text-green-400" },
  { value: "rejected", label: "Rejected", color: "bg-red-500/20 text-red-400" }
];

const sortOptions = [
  { value: "created_at", label: "Date Uploaded" },
  { value: "invoice_date", label: "Invoice Date" },
  { value: "amount", label: "Amount" },
  { value: "provider_name", label: "Provider" },
  { value: "invoice_number", label: "Invoice Number" },
  { value: "status", label: "Status" }
];

export function InvoiceFilters({ currentFilters }: InvoiceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentFilters.search || "");

  const updateFilters = (updates: Partial<CurrentFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove each filter
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('sortBy', 'created_at');
    params.set('sortOrder', 'desc');
    setSearchInput("");
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const activeFiltersCount = [
    currentFilters.status,
    currentFilters.provider,
    currentFilters.search
  ].filter(Boolean).length;

  const currentSortOption = sortOptions.find(opt => opt.value === currentFilters.sortBy);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search invoices, providers, invoice numbers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ search: undefined });
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </form>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-600 bg-slate-700/50">
                <Filter className="h-4 w-4 mr-2" />
                Status
                {currentFilters.status && (
                  <Badge className="ml-2 h-5 px-1.5 text-xs bg-blue-500/20 text-blue-400">
                    1
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={() => updateFilters({ status: undefined })}
                className="text-slate-300 hover:bg-slate-700"
              >
                All Statuses
              </DropdownMenuItem>
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => updateFilters({ status: status.value })}
                  className="text-slate-300 hover:bg-slate-700"
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${status.color.split(' ')[0]}`} />
                    {status.label}
                    {currentFilters.status === status.value && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-600 bg-slate-700/50">
                Sort: {currentSortOption?.label}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => updateFilters({ 
                    sortBy: option.value,
                    sortOrder: currentFilters.sortBy === option.value && currentFilters.sortOrder === 'asc' ? 'desc' : 'asc'
                  })}
                  className="text-slate-300 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    <div className="flex items-center">
                      {currentFilters.sortBy === option.value && (
                        <span className="text-xs text-slate-400 mr-2">
                          {currentFilters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                      {currentFilters.sortBy === option.value && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-slate-600 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {currentFilters.status && (
              <Badge 
                className="bg-blue-500/20 text-blue-400 border-blue-500/30 pr-1"
                onClick={() => updateFilters({ status: undefined })}
              >
                Status: {statusOptions.find(s => s.value === currentFilters.status)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-blue-500/30"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {currentFilters.provider && (
              <Badge 
                className="bg-green-500/20 text-green-400 border-green-500/30 pr-1"
                onClick={() => updateFilters({ provider: undefined })}
              >
                Provider: {currentFilters.provider}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-green-500/30"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {currentFilters.search && (
              <Badge 
                className="bg-purple-500/20 text-purple-400 border-purple-500/30 pr-1"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: undefined });
                }}
              >
                Search: {currentFilters.search}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-purple-500/30"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}