<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <svg class="card-icon" viewBox="0 0 100 100" aria-hidden="true">
    <g v-if="name === 'slash'" fill="currentColor"><path d="M18 88L73 12l10 6-55 76z"/><path d="M17 66l20 20M62 24l18 18" fill="none" stroke="currentColor" stroke-width="7"/></g>
    <g v-else-if="name === 'pierce'" fill="none" stroke="currentColor" stroke-width="7"><path d="M8 50h70M55 22l28 28-28 28M12 30l20 20-20 20"/></g>
    <g v-else-if="name === 'blunt'" fill="currentColor"><path d="M31 8h38l8 25-18 14v43H41V47L23 33z"/><path d="M32 69h36v9H32z"/></g>
    <g v-else-if="name === 'block' || name === 'guard'" fill="none" stroke="currentColor" stroke-width="6"><path d="M50 7l34 14v25c0 25-14 39-34 48-20-9-34-23-34-48V21z"/><path d="M50 27v49M31 49h38"/></g>
    <g v-else-if="name === 'evade'" fill="none" stroke="currentColor" stroke-width="7"><path d="M16 22l26 28-26 28M51 22l26 28-26 28"/><path d="M88 13v74" stroke-width="4"/></g>
    <g v-else-if="name === 'melee'" fill="currentColor"><path d="M18 80L70 18l10 5-4 12-46 54zM82 80L30 18l-10 5 4 12 46 54z"/><path d="M16 64l22 22M84 64L62 86" fill="none" stroke="currentColor" stroke-width="7"/></g>
    <g v-else-if="name === 'ranged'" fill="none" stroke="currentColor" stroke-width="4"><circle cx="46" cy="53" r="29"/><circle cx="46" cy="53" r="13"/><path d="M46 10v17M46 79v13M4 53h17M71 53h17M46 53l43-34M76 19h13v13"/></g>
    <g v-else-if="name === 'spell'" fill="none" stroke="currentColor" stroke-width="4"><path d="M50 6l40 44-40 44-40-44z"/><circle cx="50" cy="50" r="25"/><path d="M50 25v50M25 50h50M32 32l36 36M68 32L32 68"/></g>
    <g v-else-if="name === 'preempt'" fill="none" stroke="currentColor" stroke-width="8"><path d="M12 24l29 26-29 26M43 24l29 26-29 26"/><path d="M84 13v74" stroke-width="4"/></g>
    <g v-else-if="name === 'ability'" fill="none" stroke="currentColor" stroke-width="5"><path d="M50 50C31 20 9 27 12 51c3 25 27 24 38-1 11 25 35 26 38 1 3-24-19-31-38-1z"/><circle cx="50" cy="50" r="10"/><path d="M50 12v17M50 71v17"/></g>
    <g v-else-if="name === 'aoe'" fill="none" stroke="currentColor" stroke-width="5"><circle cx="50" cy="57" r="11" fill="currentColor"/><circle cx="20" cy="25" r="12"/><circle cx="80" cy="25" r="12"/><path d="M27 36l14 12M73 36L59 48M20 87l19-21M80 87L61 66"/></g>
    <g v-else-if="name === 'equip'" fill="none" stroke="currentColor" stroke-width="5"><path d="M39 13h22l5 13 13 5 9 19-11 10-11-6-5 13 11 8-11 15H39l-5-13-13-5-9-19 11-10 11 6z"/><rect x="35" y="35" width="30" height="30" rx="4"/></g>
    <g v-else-if="name === 'change'" fill="none" stroke="currentColor" stroke-width="6"><path d="M18 40a35 35 0 0 1 59-15l9 10M86 12v24H62M82 60a35 35 0 0 1-59 15l-9-10M14 88V64h24"/><path d="M50 34l16 16-16 16-16-16z" fill="currentColor"/></g>
    <g v-else-if="name === 'status'" fill="none" stroke="currentColor" stroke-width="6"><path d="M27 11h46M27 89h46M34 14c0 22 7 26 16 36-9 10-16 14-16 36M66 14c0 22-7 26-16 36 9 10 16 14 16 36M15 85L85 15"/></g>
    <g v-else-if="name === 'curse'" fill="none" stroke="currentColor" stroke-width="5"><path d="M50 7l38 25-9 45-29 17-29-17-9-45zM22 27l18 14-12 17 20 8-6 22M78 27L60 41l12 17-20 8 6 22M50 8v27M50 66v27"/><path d="M50 35l14 15-14 16-14-16z" fill="currentColor"/></g>
  </svg>
</template>

<style scoped>
.card-icon { display: block; width: 100%; height: 100%; }
</style>
