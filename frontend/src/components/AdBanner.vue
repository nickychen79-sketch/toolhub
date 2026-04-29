<template>
  <div class="ad-container my-4">
    <iframe 
      :src="adUrl"
      width="100%"
      height="100"
      frameborder="0"
      scrolling="no"
      referrerpolicy="unsafe-url"
    />
  </div>
</template>

<script setup>
const adUrl = 'https://www.profitablecpmratenetwork.com/mszwmnm2k5?key=d08f34feca0ca36a1a257454d1cbfdf2'
</script>

<style scoped>
.ad-container {
  min-height: 100px;
  overflow: hidden;
  border-radius: 8px;
}
</style>
