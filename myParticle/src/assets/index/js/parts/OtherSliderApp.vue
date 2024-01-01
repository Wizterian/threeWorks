<template>
<h3>hello other swiper vue app</h3>
</template>

<script setup>

// import { onMounted, ref } from 'vue';
// import { Swiper, SwiperSlide } from 'swiper/vue';
// import { Navigation, Pagination, Autoplay } from 'swiper';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import SliderItem from '@/components/index/SliderListItem.vue';
// import stageData from "@/assets/stage/js/stageData.json";

// const posts = stageData.posts;
// const modules = [Navigation, Pagination, Autoplay];
// const props = defineProps({
//   posts: Object,
//   slidesPV: String
// });
// const breakPoint = 768;
// let swiperFlg = ref(false);

// const onSlideChange = () => {
//   // console.log('slide change');
// };
// window.addEventListener('resize', () => resize());
// const resize = () => swiperFlg.value = breakPoint < window.innerWidth ? true : false;
// onMounted(resize);
</script>

<style lang="scss" scoped>

</style>

<style lang="scss"> // scopedは複製した要素に効かない
.swiper-slide ,
.swiper-slide-duplicate {
  height: unset;

  img {
    width: 100%;
    display: block;
    margin: 0 auto;
  }
}
</style>