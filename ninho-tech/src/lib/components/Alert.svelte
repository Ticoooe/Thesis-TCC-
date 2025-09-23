<script>
	import { ALERT_TYPES, alertMessage, alertType } from '../stores/alertStore';
	$: bgClass =
	  $alertType === ALERT_TYPES.SUCCESS ? 'bg-green-100'
	  : $alertType === ALERT_TYPES.DANGER ? 'bg-red-100'
	  : 'bg-gray-100';
  </script>
  
  {#if $alertMessage}
	<div
	  role="alert"
	  aria-live="polite"
	  class={`text-gray-900 text-center rounded-md ${bgClass} border border-gray-300 p-4 my-6`}
	>
	  {$alertMessage}
	</div>
  {/if}
  