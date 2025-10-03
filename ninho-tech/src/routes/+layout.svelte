<script>
    import "../../app.css";
    import Page from "./main.svelte";
</script>

<div class="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
    <slot>
        <Page />
    </slot>
</div>
