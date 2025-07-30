import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { marked } from 'marked';

const MermaidEditor = () => {
  const [code, setCode] = useState(`graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`);
  const [fileName, setFileName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mermaidDiagrams, setMermaidDiagrams] = useState([]);
  const [selectedDiagramIndex, setSelectedDiagramIndex] = useState(-1);
  const [inlineMode, setInlineMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(`# My Project

## Overview

This is a sample README with embedded mermaid diagrams.

## Architecture

\`\`\`mermaid
graph TD
    A[Client] --> B[Server]
    B --> C[Database]
    B --> D[Cache]
\`\`\`

## Flow

Here's the process flow:

\`\`\`mermaid
sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request Data
    System->>Database: Query
    Database-->>System: Results
    System-->>User: Response
\`\`\`

## Conclusion

That's how it works!`);
  const previewRef = useRef(null);
  const previewContentRef = useRef(null);
  const readmePreviewRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      fontFamily: 'system-ui, Arial, sans-serif',
      fontSize: 16,
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      },
      er: {
        useMaxWidth: false
      },
      journey: {
        useMaxWidth: false
      },
      timeline: {
        useMaxWidth: false
      }
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!inlineMode && previewContentRef.current) {
        if (code.trim()) {
          try {
            // Clear any existing content first
            previewContentRef.current.innerHTML = '';
            
            // Clear mermaid's internal state for the container
            const existingDiagram = previewContentRef.current.querySelector('.mermaid');
            if (existingDiagram) {
              existingDiagram.removeAttribute('data-processed');
            }
            
            previewContentRef.current.innerHTML = '<div>Rendering...</div>';
            const id = `mermaid-diagram-${Date.now()}`;
            const { svg } = await mermaid.render(id, code);
            previewContentRef.current.innerHTML = svg;
          } catch (error) {
            console.error('Mermaid render error:', error);
            previewContentRef.current.innerHTML = `<div style="color: red; padding: 20px; background: white;">Error: ${error.message}</div>`;
          }
        } else {
          previewContentRef.current.innerHTML = '<div style="color: #666; padding: 20px; background: white;">Enter Mermaid code to see preview</div>';
        }
      }
    };

    // Add a small delay to ensure the DOM is updated when switching modes
    const timer = setTimeout(() => {
      renderDiagram();
    }, 10);

    return () => clearTimeout(timer);
  }, [code, inlineMode]);

  useEffect(() => {
    const renderReadmePreview = async () => {
      // Only process if we're in inline mode
      if (inlineMode && readmePreviewRef.current) {
        try {
          const readmeHtml = marked.parse(markdownContent);
          readmePreviewRef.current.innerHTML = readmeHtml;
          
          // Find and render any mermaid diagrams in the preview
          const mermaidBlocks = readmePreviewRef.current.querySelectorAll('code.language-mermaid');
          for (let i = 0; i < mermaidBlocks.length; i++) {
            const block = mermaidBlocks[i];
            const mermaidCode = block.textContent;
            const id = `readme-mermaid-${Date.now()}-${i}`;
            
            try {
              const { svg } = await mermaid.render(id, mermaidCode);
              const container = document.createElement('div');
              container.className = 'mermaid-diagram-container';
              container.innerHTML = svg;
              block.parentNode.replaceChild(container, block);
            } catch (error) {
              console.error('Mermaid render error in README:', error);
              const errorDiv = document.createElement('div');
              errorDiv.style.color = 'red';
              errorDiv.style.padding = '10px';
              errorDiv.style.background = '#fee';
              errorDiv.textContent = `Mermaid Error: ${error.message}`;
              block.parentNode.replaceChild(errorDiv, block);
            }
          }
        } catch (error) {
          console.error('README preview error:', error);
          readmePreviewRef.current.innerHTML = `<div style="color: red;">Error rendering README: ${error.message}</div>`;
        }
      }
    };

    renderReadmePreview();
  }, [markdownContent, inlineMode]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const parseMermaidFromMarkdown = (markdownContent) => {
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    const diagrams = [];
    let match;
    let index = 0;

    while ((match = mermaidRegex.exec(markdownContent)) !== null) {
      const diagramCode = match[1].trim();
      
      // Try to extract a title from the preceding heading
      const beforeDiagram = markdownContent.substring(0, match.index);
      const headingMatches = beforeDiagram.match(/(?:^|\n)(#{1,6})\s+(.+)$/gm);
      let title = `Diagram ${index + 1}`;
      
      if (headingMatches && headingMatches.length > 0) {
        const lastHeading = headingMatches[headingMatches.length - 1];
        const headingText = lastHeading.replace(/^#+\s+/, '').trim();
        if (headingText) {
          title = headingText;
        }
      }

      // Get diagram type from first line
      const firstLine = diagramCode.split('\n')[0].trim();
      let type = 'Unknown';
      if (firstLine.includes('graph')) type = 'Flowchart';
      else if (firstLine.includes('sequenceDiagram')) type = 'Sequence';
      else if (firstLine.includes('flowchart')) type = 'Flowchart';
      else if (firstLine.includes('classDiagram')) type = 'Class';
      else if (firstLine.includes('stateDiagram')) type = 'State';
      else if (firstLine.includes('erDiagram')) type = 'ER';
      else if (firstLine.includes('journey')) type = 'Journey';
      else if (firstLine.includes('gantt')) type = 'Gantt';

      diagrams.push({
        title,
        type,
        code: diagramCode,
        index
      });
      index++;
    }

    return diagrams;
  };

  const handleFileOpen = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        
        if (file.name.toLowerCase().endsWith('.md')) {
          // For markdown files, switch to inline mode and load the content
          setInlineMode(true);
          setMarkdownContent(content);
          
          // Also parse for diagram selection in standalone mode
          const diagrams = parseMermaidFromMarkdown(content);
          setMermaidDiagrams(diagrams);
          
          if (diagrams.length > 0) {
            setSelectedDiagramIndex(0);
            setCode(diagrams[0].code);
          } else {
            setCode('// No Mermaid diagrams found in this Markdown file');
            setMermaidDiagrams([]);
            setSelectedDiagramIndex(-1);
          }
        } else {
          // Regular .mmd file - switch to standalone mode
          setInlineMode(false);
          setCode(content);
          setMermaidDiagrams([]);
          setSelectedDiagramIndex(-1);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDiagramSelect = (index) => {
    if (index >= 0 && index < mermaidDiagrams.length) {
      setSelectedDiagramIndex(index);
      setCode(mermaidDiagrams[index].code);
      // Reset zoom and pan when switching diagrams
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const handleFileSave = () => {
    const content = inlineMode ? markdownContent : code;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = inlineMode ? (fileName || 'README.md') : (fileName || 'diagram.mmd');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsImage = async (format = 'png') => {
    const svgElement = previewContentRef.current?.querySelector('svg');
    if (!svgElement) {
      alert('No diagram to export');
      return;
    }

    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true);
      
      // Set explicit dimensions if not present
      const svgRect = svgElement.getBoundingClientRect();
      if (!clonedSvg.getAttribute('width')) {
        clonedSvg.setAttribute('width', svgRect.width);
      }
      if (!clonedSvg.getAttribute('height')) {
        clonedSvg.setAttribute('height', svgRect.height);
      }

      // Add white background for PNG export
      if (format === 'png') {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'white');
        clonedSvg.insertBefore(rect, clonedSvg.firstChild);
      }

      // Convert SVG to string
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

      if (format === 'svg') {
        // Direct SVG download
        const url = URL.createObjectURL(svgBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'diagram') + '.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Convert to PNG via canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'diagram') + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 'image/png');
        };

        img.onerror = () => {
          alert('Failed to export image. Please try again.');
        };

        const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
        img.src = svgDataUrl;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  return (
    <div className="mermaid-editor">
      <div className="toolbar">
        <input
          type="file"
          accept=".mmd,.txt,.md"
          onChange={handleFileOpen}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" className="button">
          Open File
        </label>
        <button onClick={handleFileSave} className="button">
          Save File
        </button>
        <button 
          onClick={() => exportAsImage('png')} 
          className="button export-button"
          disabled={inlineMode}
          style={inlineMode ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          title={inlineMode ? "Export not available in inline README mode" : "Export as PNG"}
        >
          Export PNG
        </button>
        <button 
          onClick={() => exportAsImage('svg')} 
          className="button export-button"
          disabled={inlineMode}
          style={inlineMode ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          title={inlineMode ? "Export not available in inline README mode" : "Export as SVG"}
        >
          Export SVG
        </button>
        <input
          type="text"
          placeholder={inlineMode ? "README.md" : "filename.mmd"}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="filename-input"
        />
        <label className="inline-mode-toggle">
          <input
            type="checkbox"
            checked={inlineMode}
            onChange={(e) => {
              const newMode = e.target.checked;
              setInlineMode(newMode);
              
              // When switching from inline to standalone mode, extract the first diagram
              if (!newMode && mermaidDiagrams.length > 0) {
                setCode(mermaidDiagrams[0].code);
              }
              
              // Force re-render by resetting zoom/pan
              if (!newMode) {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }
            }}
          />
          <span>Inline README Mode</span>
        </label>
        {mermaidDiagrams.length > 0 && !inlineMode && (
          <select
            value={selectedDiagramIndex}
            onChange={(e) => handleDiagramSelect(parseInt(e.target.value))}
            className="diagram-selector"
          >
            {mermaidDiagrams.map((diagram, index) => (
              <option key={index} value={index}>
                {diagram.title} ({diagram.type})
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div className="editor-container">
        <div className="editor-panel">
          <h3>{inlineMode ? 'Markdown Editor' : 'Mermaid Code'}</h3>
          <textarea
            value={inlineMode ? markdownContent : code}
            onChange={(e) => {
              if (inlineMode) {
                const newContent = e.target.value;
                setMarkdownContent(newContent);
                // Parse diagrams when markdown content changes
                const diagrams = parseMermaidFromMarkdown(newContent);
                setMermaidDiagrams(diagrams);
                if (diagrams.length > 0 && selectedDiagramIndex === -1) {
                  setSelectedDiagramIndex(0);
                }
              } else {
                setCode(e.target.value);
              }
            }}
            className="code-textarea"
            placeholder={inlineMode ? "Enter your markdown content with mermaid diagrams..." : "Enter your Mermaid diagram code here..."}
          />
        </div>
        
        <div className="preview-panel">
          <h3>{inlineMode ? 'README Preview' : 'Preview'}</h3>
          <div key={inlineMode ? 'readme' : 'mermaid'} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {inlineMode ? (
              <div className="readme-preview" ref={readmePreviewRef}>
                {/* Content will be rendered by useEffect */}
              </div>
            ) : (
              <div 
                ref={previewRef} 
                className="preview-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <div className="zoom-controls">
                  <button className="zoom-button" onClick={handleZoomOut} title="Zoom Out">-</button>
                  <div className="zoom-level">{Math.round(zoom * 100)}%</div>
                  <button className="zoom-button" onClick={handleZoomIn} title="Zoom In">+</button>
                  <button className="zoom-button" onClick={handleZoomReset} title="Reset">⌂</button>
                </div>
                <div 
                  ref={previewContentRef} 
                  className="preview-content"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidEditor;