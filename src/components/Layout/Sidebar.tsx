import {
  ChevronRight,
  Book,
  FileText,
  Star,
  Sparkles,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { subjectsAPI, documentsAPI } from "@/lib/api";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectSelect?: (subjectId: string) => void;
  onQuickFilterSelect?: (filter: 'free' | 'premium' | null) => void;
}

type SubjectItem = { id: string; name: string; count: number; icon: string };
type DocumentTypeItem = { id: string; name: string; display_name: string; count: number; icon: string };

const fallbackIcons = [
  "📐",
  "💻",
  "🧠",
  "⚛️",
  "🧪",
  "🧬",
  "📈",
  "🏢",
  "🏦",
  "📒",
  "📣",
  "⚖️",
  "🗣️",
  "🏺",
  "🗺️",
  "🧩",
  "🔧",
  "🔌",
  "🏗️",
];

const Sidebar = ({ isOpen, onClose, onSubjectSelect, onQuickFilterSelect }: SidebarProps) => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeItem[]>([]);
  const [quickStats, setQuickStats] = useState({ free: 0, premium: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects from MySQL
        const subjectsResponse = await subjectsAPI.getAll();
        const subjectRows = subjectsResponse.data || [];
        const mapped: SubjectItem[] = subjectRows.map((s: any, idx: number) => ({
          id: s.id,
          name: s.name,
          count: 0, // TODO: Add count from backend
          icon: fallbackIcons[idx % fallbackIcons.length],
        }));
        setSubjects(mapped);

        // Document types - using hardcoded list since MySQL backend doesn't have document_types table
        const hardcodedTypes: DocumentTypeItem[] = [
          { id: '1', name: 'syllabus', display_name: 'Đề cương', count: 0, icon: '📄' },
          { id: '2', name: 'exam', display_name: 'Đề thi', count: 0, icon: '📝' },
          { id: '3', name: 'slide', display_name: 'Slide', count: 0, icon: '📊' },
          { id: '4', name: 'note', display_name: 'Ghi chú', count: 0, icon: '📒' },
          { id: '5', name: 'cheat_sheet', display_name: 'Cheat sheet', count: 0, icon: '📋' },
        ];
        setDocumentTypes(hardcodedTypes);

        // Quick stats: free/premium - get from documents list
        const docsResponse = await documentsAPI.getAll();
        const docs = docsResponse.data?.documents || [];
        const freeCount = docs.filter((d: any) => !d.is_premium).length;
        const premiumCount = docs.filter((d: any) => d.is_premium === true).length;
        setQuickStats({ free: freeCount, premium: premiumCount });
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 border-r border-border/50 bg-gradient-to-b from-background via-muted/40 to-background/95 z-40 backdrop-blur-sm transition-transform duration-300",
          "shadow-lg shadow-black/5",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <ScrollArea className="h-full px-5 py-7">
          <div className="space-y-7">
            {/* Quick filters */}
            <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lọc nhanh
                </h3>
                <Sparkles className="h-4 w-4 text-premium" />
              </div>
              <div className="px-4 pb-4 pt-3 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-9 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                  onClick={() => {
                    if (onQuickFilterSelect) {
                      onQuickFilterSelect('free');
                    }
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Star className="h-4 w-4 text-emerald-500" />
                    Miễn phí
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-emerald-100 text-emerald-700 text-[11px]"
                  >
                    {quickStats.free}
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-9 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                  onClick={() => {
                    if (onQuickFilterSelect) {
                      onQuickFilterSelect('premium');
                    }
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Crown className="h-4 w-4 text-premium" />
                    Premium
                  </div>
                  <Badge className="rounded-full bg-premium/20 text-premium text-[11px]">
                    {quickStats.premium}
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Subjects */}
            <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Book className="h-4 w-4" />
                  Môn học
                </div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {subjects.length} môn
                </span>
              </div>
              <div className="px-2 pb-3 pt-2 space-y-1.5">
                {subjects.map((subject) => (
                  <Button
                    key={subject.name}
                    variant="ghost"
                    className="w-full justify-between h-9 text-left rounded-xl px-3 hover:bg-primary/5 focus-visible:ring-1 focus-visible:ring-primary/40 transition"
                    onClick={() => {
                      if (onSubjectSelect) onSubjectSelect(subject.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center min-w-0">
                      <span className="mr-2 text-lg">{subject.icon}</span>
                      <span className="text-sm font-medium truncate">{subject.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[11px] bg-muted text-muted-foreground"
                      >
                        {subject.count}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/80" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Document types */}
            <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  Loại tài liệu
                </div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Đa dạng
                </span>
              </div>
              <div className="px-2 pb-3 pt-2 space-y-1.5">
                {documentTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant="ghost"
                    className="w-full justify-between h-9 text-left rounded-xl px-3 hover:bg-primary/5 focus-visible:ring-1 focus-visible:ring-primary/40 transition"
                  >
                    <div className="flex items-center min-w-0">
                      <span className="mr-2 text-lg">{type.icon}</span>
                      <span className="text-sm font-medium truncate">{type.display_name}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full text-[11px] bg-muted text-muted-foreground"
                    >
                      {type.document_count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular instructors removed as per requirement */}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;
