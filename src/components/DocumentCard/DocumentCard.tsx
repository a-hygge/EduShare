import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Heart, Star, Eye, MessageCircle, Crown, Lock, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface DocumentCardProps {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  author: string;
  authorAvatar?: string;
  type: "syllabus" | "exam" | "slide" | "note" | "cheat_sheet" | "other";
  price: "free" | "premium";
  priceAmount?: number;
  rating: number;
  downloads: number;
  views: number;
  comments: number;
  thumbnail?: string;
  fileUrl?: string;
  fileName?: string;
  tags: string[];
  isPremium?: boolean;
  currentUserRole?: "basic" | "premium";
}

const typeLabels = {
  syllabus: "Đề cương",
  exam: "Đề thi",
  slide: "Slide",
  note: "Ghi chú", 
  cheat_sheet: "Cheat sheet",
  other: "Khác"
};

const typeIcons = {
  syllabus: "📄",
  exam: "📝",
  slide: "📊", 
  note: "📒",
  cheat_sheet: "📋",
  other: "📄"
};

const DocumentCard = ({
  id,
  title,
  subject,
  instructor,
  author,
  authorAvatar,
  type, 
  price, 
  priceAmount,
  rating, 
  downloads, 
  views, 
  comments,
  thumbnail,
  fileUrl,
  fileName,
  tags,
  isPremium = false,
  currentUserRole
}: DocumentCardProps) => {
  const storageKey = useMemo(() => `studocu-liked-${id}`, [id]);
  const [isLiked, setIsLiked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(storageKey) === "1";
    } catch (error) {
      console.warn("Unable to read liked state", error);
      return false;
    }
  });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(thumbnail || null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const navigate = useNavigate();
  const canDownload = price === "free" || currentUserRole === "premium";
  const formattedStats = useMemo(() => ({
    views: new Intl.NumberFormat("vi-VN").format(views ?? 0),
    downloads: new Intl.NumberFormat("vi-VN").format(downloads ?? 0),
    rating: rating.toFixed(1),
  }), [downloads, rating, views]);

  const handleCardClick = () => {
    navigate(`/document/${id}`);
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDownload) return;
    if (!fileUrl) return;
    try {
      window.open(fileUrl, "_blank");
      // TODO: Track download via MySQL API
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Download failed:', err);
      }
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          if (next) {
            window.localStorage.setItem(storageKey, "1");
          } else {
            window.localStorage.removeItem(storageKey);
          }
        } catch (error) {
          console.warn("Unable to persist liked state", error);
        }
      }
      return next;
    });
  };

  // Thumbnail generation disabled - PDF worker causes errors
  // useEffect(() => {
  //   let isCancelled = false;

  //   const generateThumbnailIfNeeded = async () => {
  //     if (thumbnailUrl || !fileUrl || !fileName) {
  //       return;
  //     }

  //     setIsGeneratingThumbnail(true);
  //     try {
  //       const generatedThumbnail = await generateDocumentThumbnail({
  //         fileUrl,
  //         fileName,
  //         title,
  //       });

  //       if (!isCancelled && generatedThumbnail) {
  //         setThumbnailUrl(generatedThumbnail);
  //       }
  //     } catch (error) {
  //       console.error(`[DocumentCard ${id}] Error generating thumbnail:`, error);
  //     } finally {
  //       if (!isCancelled) {
  //         setIsGeneratingThumbnail(false);
  //       }
  //     }
  //   };

  //   void generateThumbnailIfNeeded();

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [fileUrl, fileName, id, thumbnailUrl, title]);

  const displayTags = useMemo(() => tags.slice(0, 3), [tags]);
  const remainingTags = Math.max(0, tags.length - displayTags.length);

  return (
    <Card
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      onClick={handleCardClick}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/7 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <CardHeader className="relative z-10 space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            <span className="mr-1">{typeIcons[type]}</span>
            {typeLabels[type]}
          </Badge>
          <div className="flex items-center space-x-1">
            {price === "premium" && (
              <Crown className="h-3 w-3 text-premium" />
            )}
            {price === "free" ? (
              <Badge variant="outline" className="text-xs border-success/60 bg-success/10 text-success">
                Miễn phí
              </Badge>
            ) : (
              <Badge className="bg-premium text-premium-foreground text-xs shadow-sm">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/40 bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              onError={() => setThumbnailUrl(null)} // Fallback if image fails to load
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-600/10">
              {isGeneratingThumbnail ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                  <span className="text-xs text-muted-foreground">Đang tạo preview...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 text-primary/80 mb-2" />
                  <span className="text-4xl">{typeIcons[type]}</span>
                </>
              )}
            </div>
          )}
          {price === "premium" && (
            <div className="absolute right-2 top-2 rounded-full bg-premium/95 p-1 text-white shadow-sm">
              <Lock className="h-3 w-3" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 text-sm font-semibold leading-tight text-foreground line-clamp-2">
              {title}
            </h3>
            {price === "premium" && (
              <Badge className="h-4 shrink-0 bg-premium text-[10px] text-white shadow-sm">
                PREMIUM
              </Badge>
            )}
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><strong>Môn:</strong> {subject}</p>
            <p><strong>GV:</strong> {instructor}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex-1 space-y-4 pb-4 pt-0">
        <div className="flex flex-wrap gap-1">
          {displayTags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-muted/70 px-2 py-0 text-xs">
              {tag}
            </Badge>
          ))}
          {remainingTags > 0 && (
            <Badge variant="outline" className="bg-muted/70 px-2 py-0 text-xs">
              +{remainingTags}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2 rounded-xl bg-muted/40 px-3 py-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback className="text-xs">{author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{author}</span>
            <span className="text-[11px] text-muted-foreground">Tác giả</span>
          </div>
          {isPremium && (
            <Crown className="h-3 w-3 text-premium" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
          <div className="flex items-center gap-1 rounded-lg bg-background/60 px-2 py-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-foreground">{formattedStats.rating}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-background/60 px-2 py-1">
            <Eye className="h-3 w-3" />
            <span>{formattedStats.views}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-background/60 px-2 py-1">
            <Download className="h-3 w-3" />
            <span>{formattedStats.downloads}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-background/60 px-2 py-1">
            <MessageCircle className="h-3 w-3" />
            <span>{comments}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative z-10 border-t border-border/60 bg-background/60 px-6 py-4">
        <div className="flex w-full items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className={cn(
                  "flex-1 text-xs font-semibold shadow-sm transition-all",
                  canDownload
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white hover:brightness-110"
                    : "bg-muted text-muted-foreground hover:bg-muted"
                )}
                disabled={!canDownload}
                onClick={handleButtonClick}
              >
                <Download className="mr-1 h-3 w-3" />
                {canDownload ? "Tải về" : "Cần Premium"}
              </Button>
            </TooltipTrigger>
            {!canDownload && (
              <TooltipContent side="top" className="flex items-center gap-2 text-xs">
                <Info className="h-3 w-3" />
                Nâng cấp gói Premium để tải tài liệu này
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleLike}
                className={cn(
                  "px-3 transition-colors",
                  isLiked ? "border-red-200 bg-red-50 text-red-500" : ""
                )}
                aria-pressed={isLiked}
                aria-label={isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart className={cn("h-3 w-3 transition-colors", isLiked ? "fill-current" : "")}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isLiked ? "Đã thêm vào yêu thích" : "Thêm vào danh sách yêu thích"}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
