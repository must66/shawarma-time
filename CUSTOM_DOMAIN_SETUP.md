# Custom domain setup: shawarmatime.nl

The website is prepared for `shawarmatime.nl`, but the domain should only be activated after DNS is configured.

## DNS records

At the domain provider for `shawarmatime.nl`, add GitHub Pages DNS records:

```txt
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: must66.github.io
```

## GitHub Pages

1. Open GitHub repository settings.
2. Go to Pages.
3. Add custom domain: `shawarmatime.nl`.
4. Wait for DNS verification.
5. Enable HTTPS.

Do not commit a `CNAME` file until DNS verification succeeds, otherwise GitHub Pages may redirect visitors to a domain that is not ready yet.
