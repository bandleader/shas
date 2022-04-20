<script setup lang="ts">
import { ref } from 'vue'
import * as Texts from '../texts'
const props = defineProps<{text: Texts.Text, filter?: string}>()
const emit = defineEmits<{
  (e: 'bituyClicked', bituy: typeof props.text.lines[0]): void
}>()
</script>

<template>
  <div v-for="l of text.lines.filter(x => !filter || x.anchoredTo === filter)" class="piece" v-html="l.html + ' '" style="display: inline;" @click.stop="emit('bituyClicked', l)"></div>
</template>

<style scoped>
.piece:hover { background: #EEE; }
</style>
