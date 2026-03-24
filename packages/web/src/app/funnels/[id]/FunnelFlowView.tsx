'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus, Trash2, Check, ArrowRight, Globe, Mail, ShoppingCart, Video,
  FileText, Megaphone, Zap, MoreHorizontal, ExternalLink,
} from 'lucide-react';

const STEP_TYPE_LABELS: Record<string, string> = {
  LANDING_PAGE: 'Landing Page',
  LEAD_CAPTURE: 'Captura de Lead',
  EMAIL_SEQUENCE: 'Sequencia de Emails',
  SALES_PAGE: 'Pagina de Vendas',
  CHECKOUT: 'Checkout',
  UPSELL: 'Upsell',
  THANK_YOU: 'Obrigado',
  WEBINAR: 'Webinar',
  VIDEO: 'Video',
  SOCIAL_POST: 'Post Social',
  AD: 'Anuncio',
  OTHER: 'Outro',
};

const STEP_TYPE_ICONS: Record<string, any> = {
  LANDING_PAGE: Globe, LEAD_CAPTURE: FileText, EMAIL_SEQUENCE: Mail,
  SALES_PAGE: ShoppingCart, CHECKOUT: ShoppingCart, UPSELL: Zap,
  THANK_YOU: Check, WEBINAR: Video, VIDEO: Video,
  SOCIAL_POST: Megaphone, AD: Megaphone, OTHER: MoreHorizontal,
};

interface FunnelFlowViewProps {
  funnel: any;
  onAddStage: () => void;
  onDeleteStage: (stageId: string) => void;
  onAddStep: (stageId: string) => void;
  onDeleteStep: (stageId: string, stepId: string) => void;
  onToggleStepStatus: (stageId: string, stepId: string, currentStatus: string) => void;
  onEditStep: (stepId: string, data: any) => void;
}

function StageNodeComponent({ data }: { data: any }) {
  return (
    <div className="rounded-xl border-2 shadow-sm bg-white min-w-[250px]" style={{ borderColor: data.color }}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !border-white" style={{ background: data.color }} />
      <div className="px-4 py-3 rounded-t-[10px] flex items-center justify-between" style={{ backgroundColor: data.color + '18' }}>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-bold text-sm text-text-primary">{data.title}</span>
          <span className="text-xs text-text-muted">({data.stepCount})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); data.onAddStep(); }}
            className="p-1 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); data.onDelete(); }}
            className="p-1 rounded text-text-muted hover:text-status-failed hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="px-4 py-1.5">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${data.progress}%`, backgroundColor: data.color }} />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !border-white" style={{ background: data.color }} />
    </div>
  );
}

function StepNodeComponent({ data }: { data: any }) {
  const StepIcon = STEP_TYPE_ICONS[data.type] || MoreHorizontal;
  const statusColors: Record<string, string> = {
    TODO: 'border-gray-300',
    IN_PROGRESS: 'bg-blue-500 border-blue-500 text-white',
    DONE: 'bg-green-500 border-green-500 text-white',
  };

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm min-w-[230px] hover:border-primary/30 transition-colors group">
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !border-2 !border-white !bg-gray-400" />
      <div className="p-3">
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); data.onToggleStatus(); }}
            className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${statusColors[data.status] || statusColors.TODO}`}
          >
            {data.status === 'DONE' && <Check className="w-3 h-3" />}
            {data.status === 'IN_PROGRESS' && <ArrowRight className="w-3 h-3" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${data.status === 'DONE' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
              {data.title}
            </p>
            {data.description && (
              <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">{data.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-0.5 text-[10px] text-text-muted">
                <StepIcon className="w-3 h-3" />
                {STEP_TYPE_LABELS[data.type]}
              </span>
              {data.link && (
                <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-primary" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); data.onDelete(); }}
            className="p-1 rounded text-text-muted hover:text-status-failed hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !border-2 !border-white !bg-gray-400" />
    </div>
  );
}

const nodeTypes = {
  stage: StageNodeComponent,
  step: StepNodeComponent,
};

function FunnelFlowInner({
  funnel,
  onAddStage,
  onDeleteStage,
  onAddStep,
  onDeleteStep,
  onToggleStepStatus,
}: FunnelFlowViewProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const STAGE_GAP_X = 350;
    const STEP_OFFSET_Y = 100;
    const STEP_GAP_Y = 80;
    const STAGE_Y = 50;

    funnel.stages.forEach((stage: any, stageIdx: number) => {
      const stageSteps = stage.steps || [];
      const stageDone = stageSteps.filter((s: any) => s.status === 'DONE').length;
      const stageProgress = stageSteps.length > 0 ? Math.round((stageDone / stageSteps.length) * 100) : 0;
      const stageX = stageIdx * STAGE_GAP_X;

      nodes.push({
        id: `stage-${stage.id}`,
        type: 'stage',
        position: { x: stageX, y: STAGE_Y },
        data: {
          title: stage.title,
          color: stage.color,
          stepCount: stageSteps.length,
          progress: stageProgress,
          onDelete: () => onDeleteStage(stage.id),
          onAddStep: () => onAddStep(stage.id),
        },
      });

      // Edge to next stage
      if (stageIdx < funnel.stages.length - 1) {
        const nextStage = funnel.stages[stageIdx + 1];
        edges.push({
          id: `edge-stage-${stage.id}-${nextStage.id}`,
          source: `stage-${stage.id}`,
          target: `stage-${nextStage.id}`,
          type: 'smoothstep',
          style: { stroke: stage.color, strokeWidth: 2 },
          animated: true,
        });
      }

      // Step nodes
      stageSteps.forEach((step: any, stepIdx: number) => {
        const stepId = `step-${step.id}`;
        nodes.push({
          id: stepId,
          type: 'step',
          position: { x: stageX + 10, y: STAGE_Y + STEP_OFFSET_Y + stepIdx * STEP_GAP_Y },
          data: {
            title: step.title,
            description: step.description,
            type: step.type,
            status: step.status,
            link: step.link,
            onToggleStatus: () => onToggleStepStatus(stage.id, step.id, step.status),
            onDelete: () => onDeleteStep(stage.id, step.id),
          },
        });

        // Edge from stage to first step, or between steps
        if (stepIdx === 0) {
          edges.push({
            id: `edge-stage-step-${stage.id}-${step.id}`,
            source: `stage-${stage.id}`,
            target: stepId,
            type: 'smoothstep',
            style: { stroke: stage.color + '80', strokeWidth: 1.5 },
          });
        } else {
          const prevStep = stageSteps[stepIdx - 1];
          edges.push({
            id: `edge-step-${prevStep.id}-${step.id}`,
            source: `step-${prevStep.id}`,
            target: stepId,
            type: 'smoothstep',
            style: { stroke: '#d1d5db', strokeWidth: 1 },
          });
        }
      });
    });

    return { nodes, edges };
  }, [funnel, onDeleteStage, onAddStep, onDeleteStep, onToggleStepStatus]);

  return (
    <div className="w-full rounded-xl border border-border bg-white overflow-hidden" style={{ height: '70vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#f0efec" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'stage') return node.data?.color || '#6366f1';
            return '#e5e7eb';
          }}
          maskColor="rgba(255,255,255,0.8)"
          position="bottom-left"
        />
      </ReactFlow>
    </div>
  );
}

export default function FunnelFlowView(props: FunnelFlowViewProps) {
  return (
    <ReactFlowProvider>
      <FunnelFlowInner {...props} />
    </ReactFlowProvider>
  );
}
