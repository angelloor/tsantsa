;
; BIND data file for local loopback interface
;
$TTL	604800
@	IN	SOA	evatsantsa.com. root.evatsantsa.com. (
			      2		; Serial
			 604800		; Refresh
			  86400		; Retry
			2419200		; Expire
			 604800 )	; Negative Cache TTL
;
@	IN	NS	ns.evatsantsa.com.
@	IN	A	65.108.58.90
@	IN	AAAA	::1
ns	IN	A	65.108.58.90
