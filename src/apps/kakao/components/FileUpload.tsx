import { useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    fileName?: string;
    isLoading?: boolean;
}

export default function FileUpload({
    onFileSelect,
    fileName,
    isLoading,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.name.endsWith('.txt')) {
            onFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            className={`file-upload ${isLoading ? 'loading' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <input
                type="file"
                ref={inputRef}
                accept=".txt"
                onChange={handleFileChange}
                className="file-input"
            />
            <div className="upload-content" onClick={() => inputRef.current?.click()}>
                <div className="upload-icon">📁</div>
                <h3>카카오톡 대화 내역 업로드</h3>
                <p className="upload-desc">
                    카카오톡에서 내보낸 .txt 파일을 드래그하거나 클릭하여 업로드
                </p>
                <button className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? '분석 중...' : '파일 선택'}
                </button>
                {fileName && <div className="file-name">선택된 파일: {fileName}</div>}
            </div>
        </div>
    );
}
