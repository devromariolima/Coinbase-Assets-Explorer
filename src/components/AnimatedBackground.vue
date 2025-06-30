<template>
  <div class="animated-background">
    <div class="circles">
      <ul>
        <li
          v-for="(bubble, index) in bubbles"
          :key="index"
          :style="bubbleStyle(bubble)"
        />
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedBackground',
  data () {
    return {
      bubbles: this.generateBubbles(100)
    }
  },
  methods: {
    generateBubbles (count) {
      const bubbles = []
      for (let i = 0; i < count; i++) {
        bubbles.push({
          size: this.randomBetween(30, 100),
          left: this.randomBetween(0, 95),
          delay: this.randomBetween(0, 15),
          duration: this.randomBetween(15, 45),
          opacity: this.randomBetween(0.1, 0.3),
          borderRadius: '0'
        })
      }
      return bubbles
    },
    randomBetween (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    bubbleStyle (bubble) {
      return {
        width: `${bubble.size}px`,
        height: `${bubble.size}px`,
        left: `${bubble.left}%`,
        animationDelay: `${bubble.delay}s`,
        animationDuration: `${bubble.duration}s`,
        background: `rgba(255, 255, 255, ${bubble.opacity})`,
        borderRadius: bubble.borderRadius
      }
    }
  }
}
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #4e54c8;
  background: -webkit-linear-gradient(to left, #8f94fb, #4e54c8);
  background: linear-gradient(to left, #8f94fb, #4e54c8);
  overflow: hidden;
}

.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circles li {
  position: absolute;
  display: block;
  list-style: none;
  animation: animate 25s linear infinite;
  bottom: -150px;
}

@keyframes animate {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
}
</style>