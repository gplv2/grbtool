<pre>
Hi,

This is a GRB/OSM tool password reset mail:

Click here to reset your password: <a href="{{ $link = url(sprintf('/#/reset?resettoken=%s',$token) ).'&email='.urlencode($user->getEmailForPasswordReset()) }}"> {{ $link }} </a>

In case you didn't trigger this yourself just ignore this mail.

</pre>
