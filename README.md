# Relative time

Shows the time relative to now (e.g. 'a few seconds ago', '42 minutes ago' or 'in 1 hour')

## Installation

This plugin requires jQuery (any version) to run

```
<script src="/path/to/relative-time/relative-time.js"></script>
```

## Usage

```
<time class="relative-time" datetime="2018-06-22T08:00:00+0200">22 juni 2018, 8:00</time>

...

<script>
$('.relative-time').relativeTime();
</script>
```