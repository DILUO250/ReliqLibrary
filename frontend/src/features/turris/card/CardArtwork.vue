<script setup lang="ts">
import CardIcon from './CardIcon.vue'

defineProps<{ special: string; typeClass: string }>()
</script>

<template>
  <div class="artwork" :class="[`art-${special || 'standard'}`, `art-type-${typeClass}`]" aria-hidden="true">
    <svg v-if="special === 'relic'" viewBox="0 0 320 184"><defs><linearGradient id="vc-art" x2="1" y2="1"><stop stop-color="#251b35"/><stop offset="1" stop-color="#633343"/></linearGradient></defs><rect width="320" height="184" fill="url(#vc-art)"/><g fill="none" stroke="#b7976c" opacity=".45"><circle cx="160" cy="92" r="67"/><circle cx="160" cy="92" r="51"/><path d="M35 157Q160 15 285 157M55 171Q160 47 265 171"/></g><path d="M90 184q8-63 39-88l19-5 23 15 24 78" fill="#161522"/><circle cx="148" cy="72" r="19" fill="#1b1827"/><path d="M177 0l-15 41 14 13-24 34 13 18-21 42 11 36" fill="none" stroke="#ffb17c" stroke-width="4"/><path d="M177 0l-15 41 14 13-24 34 13 18-21 42 11 36" fill="none" stroke="#fff0c7" stroke-width="1.2"/></svg>
    <svg v-else-if="special === 'ego'" viewBox="0 0 320 184"><rect width="320" height="184" fill="#182724"/><g fill="none" stroke="#c6bba3"><ellipse cx="160" cy="91" rx="67" ry="76"/><ellipse cx="160" cy="91" rx="51" ry="62" opacity=".65"/><path d="M48 91h49M223 91h49M76 54l36 16M208 114l36 16M76 128l36-16M208 68l36-16" opacity=".45"/></g><path d="M160 37c-27 14-39 35-39 55s12 41 39 55z" fill="#d8d2c2"/><path d="M160 37c27 14 39 35 39 55s-12 41-39 55z" fill="#796b8c"/><ellipse cx="160" cy="91" rx="19" ry="29" fill="#20232c" stroke="#c6bba3" stroke-width="2"/><path d="M160 62v58" stroke="#ede5d2" stroke-width="2"/><circle cx="160" cy="91" r="6" fill="#ede5d2"/></svg>
    <svg v-else-if="special === 'dst'" viewBox="0 0 320 184"><rect width="320" height="184" fill="#24151d"/><g fill="none" stroke="#aa98a3" opacity=".25"><path d="M0 35h105l18 12h83l16-9h98M0 72h76l25-14h105l22 18h92M0 111h94l20 15h91l24-19h91M0 149h117l17-11h76l21 14h89M54 0v54l13 19v52l-9 17v42M205 0v61l14 17v48l-12 20v38"/></g><path d="M160 22l70 49-21 76-68 19-57-53 19-72z" fill="none" stroke="#b95460" stroke-width="2"/><path d="M160 39l45 38-17 52-47 18-39-38 14-52z" fill="#241921" stroke="#ef6470" stroke-width="2"/><path d="M160 39l-14 52 42 38-47 18 19-56-58-24 14 42-14-68 44 38z" fill="#ef4f5e" opacity=".8"/><circle cx="160" cy="92" r="9" fill="#f0d5d4"/></svg>
    <svg v-else-if="special === 'shm'" viewBox="0 0 320 184"><defs><radialGradient id="vc-shm"><stop stop-color="#fff1a8"/><stop offset=".48" stop-color="#d99b37"/><stop offset="1" stop-color="#66462a"/></radialGradient></defs><rect width="320" height="184" fill="url(#vc-shm)"/><g fill="none" stroke="#fff0ad" opacity=".6"><circle cx="183" cy="81" r="61"/><circle cx="183" cy="81" r="46"/><circle cx="183" cy="81" r="28"/><path d="M183 3v26M183 134v35M102 81H70M295 81h-32M125 23l18 20M240 137l18 20M241 24l-18 20M125 139l18-20"/></g><path d="M25 184l48-93 31-13 22 22 21 84" fill="#3d3329"/><circle cx="98" cy="58" r="17" fill="#3d3329"/><path d="M102 120L262 21l19 4-12 15-156 99z" fill="#fff8d0"/></svg>
    <svg v-else-if="special === 'def'" viewBox="0 0 320 184"><defs><linearGradient id="vc-def" x2="0" y2="1"><stop stop-color="#7393a0"/><stop offset="1" stop-color="#203b4b"/></linearGradient></defs><rect width="320" height="184" fill="url(#vc-def)"/><g stroke="#c0d1d3" opacity=".2"><path d="M0 36h320M0 72h320M0 108h320M0 144h320M45 0v184M90 0v184M135 0v184M180 0v184M225 0v184M270 0v184"/></g><path d="M160 24l61 23v41c0 41-24 66-61 87-37-21-61-46-61-87V47z" fill="#9dbac2" stroke="#d5e5e5" stroke-width="2"/><path d="M160 42l43 16v30c0 31-16 51-43 68-27-17-43-37-43-68V58z" fill="#3c6578"/><path d="M160 61v75M135 84h50" stroke="#bdd5d7" stroke-width="5"/></svg>
    <template v-else><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="axis axis-x"></div><div class="axis axis-y"></div><div class="type-glyph"><CardIcon :name="typeClass" /></div></template>
  </div>
</template>

<style scoped>
.artwork { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--art-bg, #ded6ca); }
.artwork > svg { display: block; width: 100%; height: 100%; }
.orbit { position: absolute; left: 50%; top: 50%; border: 1px solid var(--accent); border-radius: 50%; opacity: .35; transform: translate(-50%,-50%); }
.orbit-a { width: 116px; height: 116px; }
.orbit-b { width: 90px; height: 90px; border-style: dashed; }
.axis { position: absolute; background: var(--accent); opacity: .25; }
.axis-x { left: 10%; right: 10%; top: 50%; height: 1px; }
.axis-y { top: 8%; bottom: 8%; left: 50%; width: 1px; }
.type-glyph { position: absolute; width: 92px; height: 92px; left: 50%; top: 50%; color: var(--accent); transform: translate(-50%,-50%); }
</style>
