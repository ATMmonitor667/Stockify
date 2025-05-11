import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:author (
          user_id,
          user_name
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    const transformedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author_id: comment.author,
      author_name: comment.profiles?.user_name || 'Anonymous',
      post_id: comment.post_id
    }));

    return NextResponse.json(transformedComments);
  } catch (error) {
    console.error('Error in comments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, postId } = await request.json();
    if (!content || !postId) {
      return NextResponse.json({ error: 'Content and postId are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          content,
          post_id: postId,
          author: session.user.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in comments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 