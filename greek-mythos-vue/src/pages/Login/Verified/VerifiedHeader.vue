<template>
    <h2>Ο λογαριασμός σας δεν είναι ενεργοποιημένος</h2>
    <span>Έχει σταλθεί ενα email επιβεβαίωσης στο <strong>{{ email }}</strong></span>
</template>

<script lang="ts" setup>
const props = defineProps({
    email: { type: String, default: '' }
})
</script>
