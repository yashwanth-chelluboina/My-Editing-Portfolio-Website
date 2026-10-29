import React, { useEffect } from 'react';
import { X, ExternalLink, Film, Image as ImageIcon, Layers } from 'lucide-react';
import { PortfolioProject } from '../data/projects';
import { getProceduralSceneDataUrl } from '../utils/proceduralMedia';
import { PlayableVideo } from './PlayableVideo';
import { ImageComparisonSlider } from './ImageComparisonSlider';

interface ProjectModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const isVideo = project.category === 'Video Editing';
  
  const resolvedFullImage =
    project.fullImageUrl && project.fullImageUrl.trim().length > 0
      ? project.fullImageUrl
      : project.thumbnailUrl && project.thumbnailUrl.trim().length > 0
        ? project.thumbnailUrl
        : getProceduralSceneDataUrl(project.fallbackSceneId, 1440, 810);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/88"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0b0b12] border border-white/12 rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-violet-300">
              <span>SLOT {project.slotNumber}</span>
              <span aria-hidden="true"> </span>
              <span>{project.category}</span>
              <span aria-hidden="true"> </span>
              <span>{project.aspectRatio}</span>
              <span aria-hidden="true"> </span>
              <span>{project.durationOrDimensions}</span>
            </div>
            <h3
              id="modal-project-title"
              className="mt-2 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight"
            >
              {project.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="p-2.5 rounded-lg bg-white/8 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Viewer Area */}
        <div className="mt-6">
          {isVideo ? (
            <PlayableVideo
              videoUrl={project.videoUrl}
              posterUrl={project.thumbnailUrl}
              fallbackSceneId={project.fallbackSceneId}
              title={project.title}
              subtitle={`SLOT ${project.slotNumber} // ${project.category.toUpperCase()}`}
            />
          ) : project.beforeImageUrl ? (
            <ImageComparisonSlider
              beforeImage={project.beforeImageUrl}
              afterImage={resolvedFullImage}
              alt={project.title}
            />
          ) : (
            <div className="relative w-full rounded-xl overflow-hidden bg-[#06060a] border border-white/10">
              <img
                src={resolvedFullImage}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[560px] object-contain mx-auto"
              />
            </div>
          )}
        </div>

        {/* Project Breakdown & Tools */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/10">
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-display text-sm font-semibold text-zinc-200">
              Creative Direction & Execution
            </h4>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {project.detailedDescription}
            </p>
          </div>
          <div className="space-y-4 bg-[#10101a] p-5 rounded-xl border border-white/8">
            <div>
              <p className="font-mono text-xs text-zinc-400">PIPELINE & TOOLS</p>
              <p className="mt-1.5 text-sm text-zinc-200 leading-relaxed">
                {project.tools.join('   ')}
              </p>
            </div>
            
            {project.projectUrl && project.projectUrl.trim().length > 0 && (
              <div className="pt-3 border-t border-white/8">
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Open External Case Study</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};