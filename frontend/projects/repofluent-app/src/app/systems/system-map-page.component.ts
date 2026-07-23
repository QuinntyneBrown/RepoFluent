import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { VisualizationCapabilityAdapter } from 'components';

@Component({
  selector: 'app-system-map-page',
  templateUrl: './system-map-page.component.html',
  styleUrl: './system-map-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemMapPageComponent {
  protected readonly capability = inject(VisualizationCapabilityAdapter);
  protected readonly selectedNodeId = signal('order-api');
  protected readonly selectedLayer = signal('all');
  protected readonly nodes = [
    {
      id: 'storefront',
      name: 'Storefront',
      kind: 'experience',
      technology: 'Angular',
      status: 'Operational',
      description: 'Collects the cart and submits checkout.',
    },
    {
      id: 'order-api',
      name: 'Order API',
      kind: 'core',
      technology: 'ASP.NET Core',
      status: 'Operational',
      description: 'Validates commands, persists intent, and publishes the workflow event.',
    },
    {
      id: 'orders-db',
      name: 'Orders DB',
      kind: 'data',
      technology: 'SQLite',
      status: 'Operational',
      description: 'Stores durable orders and state transitions.',
    },
    {
      id: 'message-bus',
      name: 'Message bus',
      kind: 'platform',
      technology: 'Event transport',
      status: 'Operational',
      description: 'Carries durable domain events to retryable workers.',
    },
    {
      id: 'order-processor',
      name: 'Order Processor',
      kind: 'core',
      technology: '.NET worker',
      status: 'Operational',
      description: 'Coordinates inventory and notification work.',
    },
    {
      id: 'inventory',
      name: 'Inventory',
      kind: 'external',
      technology: 'External API',
      status: 'Observed',
      description: 'Reserves the items required by the order.',
    },
    {
      id: 'notification',
      name: 'Notification',
      kind: 'external',
      technology: 'External API',
      status: 'Observed',
      description: 'Confirms accepted orders to the customer.',
    },
  ];
  protected readonly edges = [
    {
      from: 'storefront',
      to: 'order-api',
      relationship: 'HTTPS · POST /orders',
      direction: 'command',
      status: 'Verified',
    },
    {
      from: 'order-api',
      to: 'orders-db',
      relationship: 'EF Core · writes order',
      direction: 'data',
      status: 'Verified',
    },
    {
      from: 'order-api',
      to: 'message-bus',
      relationship: 'Publishes OrderSubmitted',
      direction: 'event',
      status: 'Verified',
    },
    {
      from: 'message-bus',
      to: 'order-processor',
      relationship: 'Consumes OrderSubmitted',
      direction: 'event',
      status: 'Verified',
    },
    {
      from: 'order-processor',
      to: 'inventory',
      relationship: 'Reserves order items',
      direction: 'command',
      status: 'Observed',
    },
    {
      from: 'order-processor',
      to: 'notification',
      relationship: 'Requests confirmation',
      direction: 'command',
      status: 'Observed',
    },
    {
      from: 'inventory',
      to: 'orders-db',
      relationship: 'Confirms reservation state',
      direction: 'data',
      status: 'Verified',
    },
  ];
  protected readonly visibleNodes = computed(() => {
    const layer = this.selectedLayer();
    return layer === 'all' ? this.nodes : this.nodes.filter((node) => node.kind === layer);
  });
  protected readonly visibleEdges = computed(() => {
    const visible = new Set(this.visibleNodes().map((node) => node.id));
    return this.selectedLayer() === 'all'
      ? this.edges
      : this.edges.filter((edge) => visible.has(edge.from) || visible.has(edge.to));
  });
  protected readonly selectedNode = computed(
    () => this.nodes.find((node) => node.id === this.selectedNodeId()) ?? this.nodes[0]!,
  );
  protected readonly selectedRelationshipCount = computed(
    () =>
      this.edges.filter(
        (edge) => edge.from === this.selectedNode().id || edge.to === this.selectedNode().id,
      ).length,
  );

  constructor() {
    void this.capability.initialize();
  }

  protected selectNode(id: string): void {
    this.selectedNodeId.set(id);
  }

  protected filterLayer(event: Event): void {
    const layer = (event.target as HTMLSelectElement).value;
    this.selectedLayer.set(layer);
    if (!this.visibleNodes().some((node) => node.id === this.selectedNodeId())) {
      this.selectedNodeId.set(this.visibleNodes()[0]?.id ?? this.nodes[0]!.id);
    }
  }

  protected nodeName(id: string): string {
    return this.nodes.find((node) => node.id === id)?.name ?? id;
  }
}
