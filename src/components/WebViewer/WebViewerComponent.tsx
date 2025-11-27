import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface WebViewerComponentProps {
  fileUrl: string;
  fileName: string;
}

const WebViewerComponent = ({ fileUrl, fileName }: WebViewerComponentProps) => {
  const viewer = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!viewer.current) return;

    console.log('[WebViewer] Initializing with:', { fileUrl, fileName });
    setIsLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      if (isLoading) {
        console.error('[WebViewer] Timeout - taking too long to load');
        setError('Viewer đang tải quá lâu. Vui lòng thử tải xuống file.');
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout

    WebViewer(
      {
        path: '/webviewer',
        initialDoc: fileUrl,
        filename: fileName,
        // licenseKey: 'YOUR_LICENSE_KEY_HERE', // Remove or add valid license
        fullAPI: false, // Tắt fullAPI để load nhanh hơn 2-3 lần
        streaming: true, // Enable streaming - giảm 30-50% thời gian load
        enableFilePicker: false,
        disableLogs: false, // Enable logs for debugging
        // Performance optimizations
        preloadWorker: 'pdf',
        useDownloader: false,
      },
      viewer.current
    ).then((instance) => {
      console.log('[WebViewer] Instance loaded successfully');
      clearTimeout(timeout);
      setIsLoading(false);
      
      const { UI, Core } = instance;

      // Customize UI
      UI.setHeaderItems((header) => {
        header.push({
          type: 'actionButton',
          img: 'icon-download',
          onClick: () => {
            window.location.href = fileUrl;
          },
        });
      });

      // Handle document load
      Core.documentViewer.addEventListener('documentLoaded', () => {
        console.log('[WebViewer] Document loaded successfully');
      });

      Core.documentViewer.addEventListener('documentLoadFailed', (err) => {
        console.error('[WebViewer] Document load failed:', err);
        setError('Không thể tải tài liệu. Vui lòng thử tải xuống.');
        setIsLoading(false);
      });
    }).catch((error) => {
      console.error('[WebViewer] Failed to initialize:', error);
      clearTimeout(timeout);
      setError(`Lỗi khởi tạo WebViewer: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      clearTimeout(timeout);
      if (viewer.current) {
        viewer.current.innerHTML = '';
      }
    };
  }, [fileUrl, fileName]);

  if (error) {
    return (
      <div className="w-full h-[700px] rounded-lg border bg-muted flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Thử lại
            </Button>
            <Button onClick={() => window.location.href = fileUrl}>
              Tải xuống
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[700px] rounded-lg overflow-hidden border relative">
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải WebViewer...</p>
            <p className="text-xs text-muted-foreground mt-2">Lần đầu có thể mất 10-15 giây</p>
          </div>
        </div>
      )}
      <div ref={viewer} className="w-full h-full" />
    </div>
  );
};

export default WebViewerComponent;
