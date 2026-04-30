@props(['rows' => [], 'columns' => [], 'actions' => null])
<div class="overflow-x-auto bg-white rounded-lg border border-black/5 shadow-sm">
    <table class="min-w-full text-sm">
        <thead class="bg-bks-card text-bks-text/70 text-xs uppercase tracking-wider">
            <tr>
                @foreach ($columns as $col)
                    <th class="px-4 py-2 text-left font-semibold">{{ $col }}</th>
                @endforeach
                @if ($actions)<th class="px-4 py-2 text-right font-semibold">Aksi</th>@endif
            </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
            {{ $slot }}
        </tbody>
    </table>
</div>
