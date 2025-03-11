<script>
    import "../../app.css";
    import Page from "./main.svelte";
</script>

<div class="bg-red-500">
    <slot>
        <Page />
    </slot>
</div>
