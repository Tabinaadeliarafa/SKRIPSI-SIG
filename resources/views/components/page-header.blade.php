@props(['title', 'breadcrumb' => [], 'source' => null])
<div class="border-b border-black/5 bg-bks-bg/60">
    <div class="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
            @if (count($breadcrumb))
                <div class="text-xs text-bks-text/60 mb-1">
                    @foreach ($breadcrumb as $i => $crumb)
                        @if ($i > 0) <span class="mx-1">›</span> @endif
                        <span>{{ $crumb }}</span>
                    @endforeach
                </div>
            @endif
            <h1 class="text-xl font-bold text-bks-primary flex items-center gap-2">
                {{ $title }}
                @if ($source)
                    <span class="text-[10px] tracking-widest bg-bks-accent/15 text-bks-accent px-2 py-0.5 rounded uppercase">{{ $source }}</span>
                @endif
            </h1>
        </div>
        <div class="flex items-center gap-2">
            {{ $slot }}
        </div>
    </div>
</div>
