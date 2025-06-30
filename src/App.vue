<script setup lang="ts">
import AnimatedBackground from './components/AnimatedBackground.vue'

</script>

<template>
  <q-layout view="hHh lpR fFf" style="position: relative; overflow: hidden;">
    <AnimatedBackground />
    <q-page-container style="position: relative; z-index: 1;">
      <router-view />
    </q-page-container>
  </q-layout>
</template>