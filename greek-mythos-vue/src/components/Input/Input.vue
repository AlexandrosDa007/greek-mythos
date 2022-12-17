<template>
    <div class="tw-w-full tw-inline-block tw-relative tw-text-left tw-p-n tw-pt-0
    tw-bg-greyout tw-h-[50px] tw-rounded-t-s tw-border-b tw-border-b-solid tw-border-b-black
    hover:tw-border-b-2" :class="{
        'tw-border-b-red-500': hasError && hasBeenTouched,
        'tw-border-b-2': hasError && hasBeenTouched,
    }">
        <input class="tw-absolute tw-bottom-s tw-pl-n tw-left-0 tw-w-full tw-bg-transparent
            tw-outline-none tw-z-10" :value="value" @input="inputHandler($event)" @focus="onFocus($event)" :type="type"
            @blur="onBlur($event)" :autocomplete="autocomplete" :min="min" :max="max" />
        <span class="tw-absolute tw-top-[15px] tw-left-0 tw-w-full tw-transition-all tw-duration-200
         tw-pb-s tw-pl-n tw-text-gray-400 tw-h-[28px] tw-text-s" :class="{
             'tw-text-xs tw-top-s': isFocused || value,
             'tw-text-red-500': hasError && hasBeenTouched
         }">
            {{ isRequired ? label + ' *' : label }}</span>
    </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue';
const isFocused = ref(false);
const hasBeenTouched = ref(false);
type InputType = 'text' | 'password' | 'email' | 'number';

const props = defineProps({
    value: { type: [String, Number], required: true },
    label: { type: String, default: '' },
    hasError: { type: Boolean },
    isRequired: { type: Boolean },
    type: { type: String as PropType<InputType>, default: 'text' },
    autocomplete: { type: String, default: 'off' },
    inputHandler: { type: Function, default: () => { } },
    focusHandler: { type: Function, default: () => { } },
    blurHandler: { type: Function, default: () => { } },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 999 },
});

function handleInput(ev: Event) {
    props.inputHandler(ev);
    // value.value = (<HTMLInputElement>ev.target).value;
    // calculateError();
}

function onFocus(ev: Event) {
    isFocused.value = true;
    props.focusHandler(ev);
}

function onBlur(ev: Event) {
    isFocused.value = false;
    props.blurHandler(ev);
    hasBeenTouched.value = true;
}

// function calculateError() {
//     const isValueUnacceptable = value.value === null || value.value === undefined || value.value === '';
//     if (isValueUnacceptable && hasBeenTouched.value) {
//         hasError.value = true;
//     } else {
//         hasError.value = false;
//     }
// }

</script>