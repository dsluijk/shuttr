type ImageZoomOptions = {
  aspectRatio: MaybeRefOrGetter<number>;
  maxScale?: number;
  stepScale?: number;
};

export const useImageZoom = (
  viewport: MaybeRefOrGetter<HTMLElement | null | undefined>,
  { aspectRatio, maxScale = 8, stepScale = 2.5 }: ImageZoomOptions,
) => {
  const scale = ref(1);
  const offsetX = ref(0);
  const offsetY = ref(0);
  const isZoomed = computed(() => scale.value > 1);
  const isGesturing = ref(false);

  const pointers = new Map<number, { x: number; y: number }>();
  let pinchDistance = 0;
  let pinchCenter: { x: number; y: number } | null = null;
  let lastPointerType = "mouse";
  let lastTap = 0;
  let gestureScale = 1;

  const contentSize = (width: number, height: number) => {
    const ratio = toValue(aspectRatio) || 1;

    return width / height > ratio
      ? { width: height * ratio, height }
      : { width, height: width / ratio };
  };

  const clampOffset = () => {
    const el = toValue(viewport);
    if (!el) return;

    const view = el.getBoundingClientRect();
    const content = contentSize(view.width, view.height);
    const maxX = Math.max(0, (content.width * scale.value - view.width) / 2);
    const maxY = Math.max(0, (content.height * scale.value - view.height) / 2);

    offsetX.value = Math.min(Math.max(offsetX.value, -maxX), maxX);
    offsetY.value = Math.min(Math.max(offsetY.value, -maxY), maxY);
  };

  const zoomTo = (target: number, clientX?: number, clientY?: number) => {
    const el = toValue(viewport);
    if (!el) return;

    const view = el.getBoundingClientRect();
    const centerX = view.left + view.width / 2;
    const centerY = view.top + view.height / 2;
    const focusX = (clientX ?? centerX) - centerX;
    const focusY = (clientY ?? centerY) - centerY;

    const next = Math.min(Math.max(target, 1), maxScale);
    const ratio = next / scale.value;

    offsetX.value = focusX - (focusX - offsetX.value) * ratio;
    offsetY.value = focusY - (focusY - offsetY.value) * ratio;
    scale.value = next;
    clampOffset();
  };

  const reset = () => {
    scale.value = 1;
    offsetX.value = 0;
    offsetY.value = 0;
  };

  const toggleZoom = (clientX?: number, clientY?: number) =>
    zoomTo(isZoomed.value ? 1 : stepScale, clientX, clientY);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    lastPointerType = e.pointerType;

    if (e.pointerType !== "mouse" && pointers.size === 0) {
      const now = Date.now();
      if (now - lastTap < 300) {
        toggleZoom(e.clientX, e.clientY);
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      pinchDistance = Math.hypot(b.x - a.x, b.y - a.y);
      pinchCenter = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    if (pointers.size > 1 || isZoomed.value) {
      isGesturing.value = true;
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    const previous = pointers.get(e.pointerId);
    if (!previous) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

      if (pinchCenter) {
        offsetX.value += center.x - pinchCenter.x;
        offsetY.value += center.y - pinchCenter.y;
      }

      if (pinchDistance > 0) {
        zoomTo(scale.value * (distance / pinchDistance), center.x, center.y);
      }

      pinchDistance = distance;
      pinchCenter = center;
      return;
    }

    if (!isZoomed.value) return;
    offsetX.value += e.clientX - previous.x;
    offsetY.value += e.clientY - previous.y;
    clampOffset();
  };

  const onPointerUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);

    if (pointers.size < 2) {
      pinchDistance = 0;
      pinchCenter = null;
    }

    if (pointers.size === 0) {
      isGesturing.value = false;
    }

    clampOffset();
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    const speed = e.ctrlKey ? 0.01 : 0.002;
    const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
    zoomTo(
      scale.value * Math.exp(-e.deltaY * lines * speed),
      e.clientX,
      e.clientY,
    );
  };

  const onDoubleClick = (e: MouseEvent) => {
    if (lastPointerType !== "mouse") return;
    toggleZoom(e.clientX, e.clientY);
  };

  type GestureEvent = Event & {
    scale: number;
    clientX: number;
    clientY: number;
  };

  useEventListener(viewport, "gesturestart", (e: Event) => {
    e.preventDefault();
    gestureScale = scale.value;
  });

  useEventListener(viewport, "gesturechange", (e: Event) => {
    e.preventDefault();
    const gesture = e as GestureEvent;
    zoomTo(gestureScale * gesture.scale, gesture.clientX, gesture.clientY);
  });

  useEventListener(viewport, "gestureend", (e: Event) => e.preventDefault());
  useEventListener(
    () => (isZoomed.value ? window : null),
    "resize",
    clampOffset,
  );

  return {
    scale,
    offsetX,
    offsetY,
    isZoomed,
    isGesturing,
    reset,
    handlers: {
      onPointerdown: onPointerDown,
      onPointermove: onPointerMove,
      onPointerup: onPointerUp,
      onPointercancel: onPointerUp,
      onWheel,
      onDblclick: onDoubleClick,
    },
  };
};
