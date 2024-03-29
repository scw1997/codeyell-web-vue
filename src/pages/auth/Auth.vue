<script setup lang="ts">
import { Outlet } from 'secywo-template-cli';
</script>

<template>
    <div class="auth">
        <div class="auth-container">
            <Outlet />
        </div>
    </div>
</template>

<style scoped lang="less">
.auth {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .auth-container {
        width: 600px;
        min-height: 300px;
        padding: 14px;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
