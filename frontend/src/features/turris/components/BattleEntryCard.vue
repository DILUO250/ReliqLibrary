<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  to: string
}>()
</script>

<template>
  <router-link :to="to" class="battle-entry">
    <div class="entry-body">
      <div class="entry-code latin">SIMULACRUM // TURRIS</div>
      <h3 class="entry-title">{{ title }}</h3>
      <p class="entry-sub">{{ subtitle }}</p>
    </div>
    <div class="entry-arrow" aria-hidden="true">→</div>
  </router-link>
</template>

<style scoped>
.battle-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  min-height: 92px;
  padding: 16px 22px;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) * 2);
  background: var(--color-surface-2);
  color: var(--color-ink);
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.battle-entry:hover {
  border-color: color-mix(in srgb, var(--accent) 70%, var(--color-line));
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 22px color-mix(in srgb, var(--accent) 14%, transparent);
}
.battle-entry:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.entry-body {
  min-width: 0;
}
.entry-code {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--color-ink-faint);
}
.entry-title {
  margin: 6px 0 4px;
  font-size: 21px;
  font-weight: 700;
  color: var(--color-ink);
}
.entry-sub {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink-dim);
  font-family: var(--font-kai);
}
.entry-arrow {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--accent) 60%, transparent);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.battle-entry:hover .entry-arrow {
  transform: translateX(4px);
  background: var(--accent);
  color: var(--on-accent);
}
</style>
